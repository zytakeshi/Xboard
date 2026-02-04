<?php

return [
    /*
    |--------------------------------------------------------------------------
    | RevenueCat Webhook Secret
    |--------------------------------------------------------------------------
    | The authorization header value configured in RevenueCat dashboard.
    | RevenueCat sends the exact value you configure (often "Bearer {secret}").
    */
    'webhook_secret' => env('REVENUECAT_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Environment
    |--------------------------------------------------------------------------
    | Process only matching events. Set to ALL to accept both.
    */
    'environment' => env('REVENUECAT_ENVIRONMENT', 'PRODUCTION'),

    /*
    |--------------------------------------------------------------------------
    | Product ID to Plan ID Mapping
    |--------------------------------------------------------------------------
    | Maps Apple product identifiers to Xboard plan IDs.
    */
    'product_plan_mapping' => [
        // ===========================================
        // PRODUCTION (App Store)
        // ===========================================
        'VpncheapOneMonth' => [
            'plan_id' => (int) env('REVENUECAT_MONTHLY_PLAN_ID', 21),
            'period' => 'monthly',
            'type' => 'non_renewing',
        ],
        'VpncheapOneYear' => [
            'plan_id' => (int) env('REVENUECAT_YEARLY_PLAN_ID', 21),
            'period' => 'yearly',
            'type' => 'non_renewing',
        ],

        // ===========================================
        // SANDBOX (Test Store)
        // ===========================================
        'monthly' => [
            'plan_id' => (int) env('REVENUECAT_SANDBOX_MONTHLY_PLAN_ID', (int) env('REVENUECAT_MONTHLY_PLAN_ID', 21)),
            'period' => 'monthly',
            'type' => 'non_renewing',
        ],
        'yearly' => [
            'plan_id' => (int) env('REVENUECAT_SANDBOX_YEARLY_PLAN_ID', (int) env('REVENUECAT_YEARLY_PLAN_ID', 21)),
            'period' => 'yearly',
            'type' => 'non_renewing',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Apple's 30% Commission Rate
    |--------------------------------------------------------------------------
    | Used to calculate net revenue after Apple's cut.
    */
    'apple_commission_rate' => 0.30,

    /*
    |--------------------------------------------------------------------------
    | Payment Method ID for RevenueCat/IAP orders
    |--------------------------------------------------------------------------
    | Create a Payment record in Xboard for Apple IAP.
    */
    'payment_id' => env('REVENUECAT_PAYMENT_ID'),
];
