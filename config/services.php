<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_V2BOARD_REGION', 'us-east-1'),
    ],

    'telegram_error_alert' => [
        'enabled' => env('TELEGRAM_ERROR_ALERT_ENABLED', false),
        'bot_token' => env('TELEGRAM_ERROR_ALERT_BOT_TOKEN'),
        'chat_id' => env('TELEGRAM_ERROR_ALERT_CHAT_ID'),
        'debounce_seconds' => env('TELEGRAM_ERROR_ALERT_DEBOUNCE_SECONDS', 60),
        'dedupe_seconds' => env('TELEGRAM_ERROR_ALERT_DEDUPE_SECONDS', 600),
    ],

];
