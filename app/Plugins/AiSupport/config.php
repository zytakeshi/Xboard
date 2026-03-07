<?php

/**
 * AiSupport Plugin Default Configuration
 *
 * These values are used as defaults when no admin_setting override exists.
 * All keys are prefixed with 'ai_support_' when stored in admin settings.
 */
return [
    // Plugin enabled state
    'enabled' => false,

    // Central AI service URL (e.g. https://ai.example.com)
    'service_url' => '',

    // API key for authenticating with the central AI service
    'api_key' => '',

    // API secret for HMAC signing requests to the central AI service
    'api_secret' => '',

    // Connector key — the central AI service uses this to authenticate callbacks to us
    'connector_key' => '',

    // Connector secret — used to verify HMAC signatures from the central AI service
    'connector_secret' => '',

    // Vendor ID assigned by the central AI service
    'vendor_id' => '',

    // BYOK (Bring Your Own Key) — optional OpenAI API key
    'openai_key' => '',

    // Maximum timestamp drift allowed for HMAC validation (seconds)
    'hmac_timestamp_tolerance' => 300,

    // HTTP timeout for requests to the central AI service (seconds)
    'http_timeout' => 30,

    // HTTP retry count for failed requests
    'http_retries' => 2,
];
