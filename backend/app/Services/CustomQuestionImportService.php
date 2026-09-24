<?php

namespace App\Services;

use App\Models\CustomFeedbackQuestion;
use App\Models\FeedbackQuestionCategory;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class CustomQuestionImportService
{
    /**
     * Allowed question types.
     */
    const ALLOWED_TYPES = ['RATING', 'TEXT', 'BOTH', 'MCQ'];

    /**
     * Parse CSV or XLSX file into array of associative row arrays.
     */
    public function parseFile(string $filePath, string $originalName): array
    {
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        if (in_array($extension, ['xlsx', 'xls'])) {
            $parsed = $this->parseXlsxFile($filePath);
            if (!empty($parsed)) {
                return $parsed;
            }
        }

        // Fallback to CSV parser
        return $this->parseCsvFile($filePath);
    }

    /**
     * Parse CSV file path into structured array.
     */
    public function parseCsvFile(string $filePath): array
    {
        $rows = [];
        if (($handle = fopen($filePath, 'r')) !== false) {
            $bom = fread($handle, 3);
            if ($bom !== "\xEF\xBB\xBF") {
                rewind($handle);
            }

            $headers = fgetcsv($handle, 4096, ',');
            if (!$headers) {
                fclose($handle);
                return [];
            }

            $sanitizedHeaders = array_map(function ($h) {
                $h = strtolower(trim($h));
                $h = preg_replace('/[^a-z0-9_]/', '', str_replace([' ', '-'], '_', $h));
                return $h;
            }, $headers);

            while (($data = fgetcsv($handle, 4096, ',')) !== false) {
                if (count($data) === 1 && trim($data[0]) === '') {
                    continue;
                }
                $row = [];
                foreach ($sanitizedHeaders as $index => $header) {
                    if (empty($header)) continue;
                    $row[$header] = isset($data[$index]) ? trim($data[$index]) : '';
                }
                $rows[] = $row;
            }
            fclose($handle);
        }
        return $rows;
    }

    /**
     * Native XLSX parser using PHP ZipArchive & SimpleXML.
     */
    public function parseXlsxFile(string $filePath): array
    {
        $zip = new ZipArchive();
        if ($zip->open($filePath) !== true) {
            return [];
        }

        // 1. Read shared strings
        $sharedStrings = [];
        $sharedStringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($sharedStringsXml !== false) {
            $xml = @simplexml_load_string($sharedStringsXml);
            if ($xml) {
                foreach ($xml->si as $val) {
                    if (isset($val->t)) {
                        $sharedStrings[] = (string)$val->t;
                    } elseif (isset($val->r)) {
                        $text = '';
                        foreach ($val->r as $r) {
                            $text .= (string)$r->t;
                        }
                        $sharedStrings[] = $text;
                    } else {
                        $sharedStrings[] = '';
                    }
                }
            }
        }

        // 2. Read sheet1
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();

        if ($sheetXml === false) {
            return [];
        }

        $xml = @simplexml_load_string($sheetXml);
        if (!$xml || !isset($xml->sheetData)) {
            return [];
        }

        $matrix = [];
        foreach ($xml->sheetData->row as $row) {
            $rowData = [];
            foreach ($row->c as $cell) {
                $colRef = (string)$cell['r'];
                preg_match('/[A-Z]+/', $colRef, $matches);
                $colLetter = $matches[0] ?? 'A';
                $colIndex = 0;
                for ($i = 0; $i < strlen($colLetter); $i++) {
                    $colIndex = $colIndex * 26 + (ord($colLetter[$i]) - 64);
                }
                $colIndex -= 1;

                $val = '';
                $type = (string)$cell['t'];

                if ($type === 's') {
                    $strIdx = (int)$cell->v;
                    $val = $sharedStrings[$strIdx] ?? '';
                } else {
                    $val = (string)$cell->v;
                }

                $rowData[$colIndex] = trim($val);
            }
            if (!empty(array_filter($rowData))) {
                ksort($rowData);
                $matrix[] = $rowData;
            }
        }

        if (empty($matrix)) {
            return [];
        }

        $rawHeaders = array_shift($matrix);
        $headers = array_map(function ($h) {
            $h = strtolower(trim((string)$h));
            return preg_replace('/[^a-z0-9_]/', '', str_replace([' ', '-'], '_', $h));
        }, $rawHeaders);

        $rows = [];
        foreach ($matrix as $rowData) {
            $row = [];
            foreach ($headers as $index => $header) {
                if (empty($header)) continue;
                $row[$header] = isset($rowData[$index]) ? (string)$rowData[$index] : '';
            }
            if (!empty(array_filter($row))) {
                $rows[] = $row;
            }
        }

        return $rows;
    }

    /**
     * Validate array of parsed question rows according to section 8 requirements.
     */
    public function validateQuestions(array $rows): array
    {
        if (empty($rows)) {
            return [
                'success' => false,
                'message' => 'Uploaded file contains no valid data rows.',
                'total_rows' => 0,
                'valid_rows_count' => 0,
                'invalid_rows_count' => 0,
                'errors' => ['File contains no valid question rows.'],
                'parsed_questions' => [],
            ];
        }

        $errors = [];
        $parsedQuestions = [];
        $seenQuestions = [];

        $existingCategories = FeedbackQuestionCategory::all()->keyBy(function ($c) {
            return strtolower(trim($c->category_name));
        });

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2; // Row number in file (1-based header + 1)
            $rowErrors = [];

            // 1. Identify question text column
            $questionText = trim($row['question'] ?? $row['question_text'] ?? $row['statement'] ?? $row['text'] ?? '');
            if (empty($questionText)) {
                $rowErrors[] = "Row {$rowNum}: 'question' field cannot be empty.";
            }

            // 2. Identify Category
            $categoryName = trim($row['category'] ?? $row['category_name'] ?? 'General');
            if (empty($categoryName)) {
                $categoryName = 'General';
            }

            $catObj = $existingCategories->get(strtolower($categoryName));
            $categoryId = $catObj?->id;

            // 3. Validate Question Type
            $typeInput = strtoupper(trim($row['question_type'] ?? $row['type'] ?? 'RATING'));
            if (empty($typeInput)) {
                $typeInput = 'RATING';
            }

            if (!in_array($typeInput, self::ALLOWED_TYPES)) {
                $rowErrors[] = "Row {$rowNum}: Invalid question_type '{$typeInput}'. Allowed types: " . implode(', ', self::ALLOWED_TYPES) . '.';
            }

            // 4. Validate options if MCQ or custom options present
            $options = null;
            if (!empty($row['options'])) {
                if (is_array($row['options'])) {
                    $options = $row['options'];
                } else {
                    $optArray = array_map('trim', explode(',', $row['options']));
                    $options = array_values(array_filter($optArray));
                }
            }

            if ($typeInput === 'MCQ' && empty($options)) {
                $rowErrors[] = "Row {$rowNum}: MCQ type question requires comma-separated options in 'options' column.";
            }

            // 5. Check for duplicate questions
            $normalizedText = strtolower($questionText);
            if (!empty($normalizedText)) {
                if (isset($seenQuestions[$normalizedText])) {
                    $rowErrors[] = "Row {$rowNum}: Duplicate question detected (same as Row {$seenQuestions[$normalizedText]}).";
                } else {
                    $seenQuestions[$normalizedText] = $rowNum;
                }
            }

            if (!empty($rowErrors)) {
                $errors = array_merge($errors, $rowErrors);
            } else {
                $parsedQuestions[] = [
                    'row_index' => $rowNum,
                    'question' => $questionText,
                    'category' => $categoryName,
                    'category_id' => $categoryId,
                    'question_type' => $typeInput,
                    'options' => $options,
                ];
            }
        }

        $totalRows = count($rows);
        $invalidCount = count(array_unique(array_map(function ($err) {
            preg_match('/Row (\d+):/', $err, $m);
            return $m[1] ?? 0;
        }, $errors)));
        $validCount = count($parsedQuestions);

        return [
            'success' => empty($errors),
            'message' => empty($errors)
                ? "Validation successful. {$validCount} custom question(s) parsed cleanly."
                : "Validation failed with " . count($errors) . " issue(s).",
            'total_rows' => $totalRows,
            'valid_rows_count' => $validCount,
            'invalid_rows_count' => $invalidCount,
            'errors' => $errors,
            'parsed_questions' => $parsedQuestions,
        ];
    }

    /**
     * Save validated custom questions into custom_feedback_questions table.
     */
    public function storeCustomQuestions(array $parsedQuestions, ?int $userAccountId): array
    {
        return DB::transaction(function () use ($parsedQuestions, $userAccountId) {
            $stored = [];
            foreach ($parsedQuestions as $q) {
                $record = CustomFeedbackQuestion::create([
                    'question' => $q['question'],
                    'category' => $q['category'] ?? 'General',
                    'category_id' => $q['category_id'] ?? null,
                    'question_type' => $q['question_type'] ?? 'RATING',
                    'options' => $q['options'] ?? null,
                    'created_by_user_account_id' => $userAccountId,
                ]);
                $stored[] = $record;
            }
            return $stored;
        });
    }
}
