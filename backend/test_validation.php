<?php
$data = ['department_id' => 1];
$validator = Validator::make($data, ['department_id' => 'exists:department,id']);
if ($validator->fails()) {
    print_r($validator->errors()->all());
} else {
    echo "Success!";
}
