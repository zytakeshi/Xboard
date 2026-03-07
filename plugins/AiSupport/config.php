<?php

/**
 * AiSupport Plugin Default Configuration
 *
 * These values are merged with the plugin row config stored in v2_plugins.
 */
return [
    // One-time Xboard pairing URL from AirPilot
    'connect_url' => '',

    // Central AI service URL (e.g. https://ai.example.com)
    'service_url' => '',

    // Vendor ID assigned by the central AI service
    'vendor_id' => '',

    // API key for authenticating with the central AI service
    'api_key' => '',

    // API secret for HMAC signing requests to the central AI service
    'api_secret' => '',

    // Connector key — the central AI service uses this to authenticate callbacks to us
    'connector_key' => '',

    // Connector secret — used to verify HMAC signatures from the central AI service
    'connector_secret' => '',

    // BYOK (Bring Your Own Key) — optional OpenAI API key
    'openai_key' => '',

    // Whether the widget should be auto-mounted through theme custom_html
    'widget_enabled' => true,

    // Pairing bookkeeping
    'paired_at' => null,
    'pairing_error' => null,
    'knowledge_imported_at' => null,
    'knowledge_import_error' => null,
    'knowledge_import_last_result' => null,

    // Maximum timestamp drift allowed for HMAC validation (seconds)
    'hmac_timestamp_tolerance' => 300,

    // HTTP timeout for requests to the central AI service (seconds)
    'http_timeout' => 30,

    // HTTP retry count for failed requests
    'http_retries' => 2,
];
