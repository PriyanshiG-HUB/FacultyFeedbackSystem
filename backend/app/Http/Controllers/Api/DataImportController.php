<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Import\DatasetImportRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DataImportController extends Controller
{
    /**
     * Get all importable dataset definitions and schemas.
     */
    public function getDatasets(): JsonResponse
    {
        $datasets = DatasetImportRegistry::getDatasets();
        return response()->json([
            'data' => array_values($datasets),
        ], Response::HTTP_OK);
    }

    /**
     * Download template for a specific dataset (CSV/XLSX format).
     */
    public function downloadTemplate(Request $request, string $datasetKey)
    {
        try {
            $csvContent = DatasetImportRegistry::generateCsvTemplate($datasetKey);
            $fileName = "{$datasetKey}_import_template.csv";

            return response($csvContent, Response::HTTP_OK, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Validate an uploaded CSV/Excel file or raw dataset rows against dataset schema.
     */
    public function validateFile(Request $request): JsonResponse
    {
        if ($request->isMethod('get')) {
            return response()->json([
                'success' => false,
                'message' => 'The GET method is not supported for file validation. Please submit a POST request with the file or dataset payload.',
            ], Response::HTTP_METHOD_NOT_ALLOWED);
        }

        $request->validate([
            'dataset_key' => ['required', 'string'],
            'file' => ['nullable', 'file', 'max:10240'],
            'rows' => ['nullable', 'array'],
        ]);

        $datasetKey = $request->input('dataset_key');
        $rows = [];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->getRealPath();
            $rows = $this->parseCsvFile($path);
        } elseif ($request->has('rows')) {
            $rows = $request->input('rows');
        } else {
            return response()->json([
                'message' => 'Either an uploaded file or array of rows is required.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (empty($rows)) {
            return response()->json([
                'success' => false,
                'message' => 'The uploaded file is empty or could not be parsed.',
                'total_rows' => 0,
                'valid_rows_count' => 0,
                'invalid_rows_count' => 0,
                'errors' => [
                    [
                        'row' => 0,
                        'column' => 'file',
                        'error' => 'File contains no valid data rows.',
                        'value' => null,
                    ]
                ],
                'preview_rows' => [],
            ], Response::HTTP_OK);
        }

        $report = DatasetImportRegistry::validate($datasetKey, $rows);
        $report['raw_rows'] = $rows;

        return response()->json($report, Response::HTTP_OK);
    }

    /**
     * Execute transactional database import for pre-validated data.
     */
    public function executeImport(Request $request): JsonResponse
    {
        if ($request->isMethod('get')) {
            return response()->json([
                'success' => false,
                'message' => 'The GET method is not supported for import execution. Please submit a POST request with the validated dataset rows.',
            ], Response::HTTP_METHOD_NOT_ALLOWED);
        }

        $request->validate([
            'dataset_key' => ['required', 'string'],
            'rows' => ['required', 'array'],
            'file_name' => ['nullable', 'string', 'max:255'],
        ]);

        $datasetKey = $request->input('dataset_key');
        $rows = $request->input('rows');
        $fileName = $request->input('file_name', "{$datasetKey}_bulk_import.csv");
        $userId = $request->user()?->id ?? 1;

        try {
            $result = DatasetImportRegistry::executeImport($datasetKey, $rows, $userId, $fileName);
            return response()->json($result, Response::HTTP_OK);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database import failed: ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Helper to parse CSV file path into structured array of row associative arrays.
     */
    private function parseCsvFile(string $filePath): array
    {
        $rows = [];
        if (($handle = fopen($filePath, 'r')) !== false) {
            // Remove UTF-8 BOM if present
            $bom = fread($handle, 3);
            if ($bom !== "\xEF\xBB\xBF") {
                rewind($handle);
            }

            $headers = fgetcsv($handle, 2048, ',');
            if (!$headers) {
                fclose($handle);
                return [];
            }

            // Sanitize headers
            $headers = array_map(function ($h) {
                return strtolower(trim(preg_replace('/[^a-zA-Z0-9_]/', '', $h)));
            }, $headers);

            while (($data = fgetcsv($handle, 2048, ',')) !== false) {
                if (count($data) === 1 && trim($data[0]) === '') {
                    continue; // Skip empty trailing lines
                }
                $row = [];
                foreach ($headers as $index => $header) {
                    if (empty($header)) continue;
                    $row[$header] = isset($data[$index]) ? trim($data[$index]) : '';
                }
                $rows[] = $row;
            }
            fclose($handle);
        }
        return $rows;
    }
}
