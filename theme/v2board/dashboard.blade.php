<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="/theme/{{$theme}}/assets/components.chunk.css?v={{$version}}">
    <link rel="stylesheet" href="/theme/{{$theme}}/assets/umi.css?v={{$version}}">
    @if (file_exists(public_path("/theme/{$theme}/assets/custom.css")))
        <link rel="stylesheet" href="/theme/{{$theme}}/assets/custom.css?v={{$version}}">
    @endif
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no">
    @php ($colors = [
        'darkblue' => '#3b5998',
        'black' => '#343a40',
        'default' => '#0665d0',
        'green' => '#319795'
    ])
    <meta name="theme-color" content="{{$colors[$theme_config['theme_color']]}}">

    <title>{{$title}}</title>
    <!-- <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Nunito+Sans:300,400,400i,600,700"> -->
    <script>window.routerBase = "/";</script>
    <script>
        window.settings = {
            title: '{{$title}}',
            assets_path: '/theme/{{$theme}}/assets',
            theme: {
                sidebar: '{{$theme_config['theme_sidebar']}}',
                header: '{{$theme_config['theme_header']}}',
                color: '{{$theme_config['theme_color']}}',
            },
            version: '{{$version}}',
            background_url: '{{$theme_config['background_url']}}',
            description: '{{$description}}',
            i18n: [
                'zh-CN',
                'en-US',
                'ja-JP',
                'vi-VN',
                'ko-KR',
                'zh-TW',
                'fa-IR'
            ],
            logo: '{{$logo}}'
        }
    </script>
    <script src="/theme/{{$theme}}/assets/i18n/zh-CN.js?v={{$version}}"></script>
    <script src="/theme/{{$theme}}/assets/i18n/zh-TW.js?v={{$version}}"></script>
    <script src="/theme/{{$theme}}/assets/i18n/en-US.js?v={{$version}}"></script>
    <script src="/theme/{{$theme}}/assets/i18n/ja-JP.js?v={{$version}}"></script>
    <script src="/theme/{{$theme}}/assets/i18n/vi-VN.js?v={{$version}}"></script>
    <script src="/theme/{{$theme}}/assets/i18n/ko-KR.js?v={{$version}}"></script>
    <script src="/theme/{{$theme}}/assets/i18n/fa-IR.js?v={{$version}}"></script>
</head>

<body>
<div id="root"></div>
{!! $theme_config['custom_html'] !!}
<script src="/theme/{{$theme}}/assets/vendors.async.js?v={{$version}}"></script>
<script src="/theme/{{$theme}}/assets/components.async.js?v={{$version}}"></script>
<script src="/theme/{{$theme}}/assets/umi.js?v={{$version}}"></script>
@if (admin_setting('ai_support_enabled', false))
    <script>
        (function () {
            if (window.__airpilotBootstrapInstalled) return;
            window.__airpilotBootstrapInstalled = true;

            var widgetScriptLoaded = false;
            var widgetStarted = false;

            function getAuthToken() {
                try {
                    var raw = window.localStorage.getItem('authorization');
                    if (!raw) return '';
                    if (raw.indexOf('{') === 0) {
                        var parsed = JSON.parse(raw);
                        return parsed && parsed.value ? String(parsed.value).replace(/^Bearer\s+/i, '') : '';
                    }
                    return String(raw).replace(/^Bearer\s+/i, '');
                } catch (e) {
                    return '';
                }
            }

            function currentHash() {
                return (window.location.hash || '').toLowerCase();
            }

            function shouldStart() {
                var hash = currentHash();
                if (!hash || hash === '#/' || hash.indexOf('#/dashboard') === 0) return true;
                if (hash.indexOf('#/login') === 0 || hash.indexOf('#/register') === 0 || hash.indexOf('#/forget') === 0) {
                    return false;
                }
                return true;
            }

            function initWidget() {
                if (widgetStarted || !window.AirPilot || !window.AirPilot.init) return;
                var token = getAuthToken();
                if (!token || !shouldStart()) return;

                widgetStarted = true;
                window.AirPilot.init({
                    apiBaseUrl: '/api/v1/user/ai-support',
                    authToken: token,
                    locale: (window.localStorage.getItem('i18nextLng') || 'zh-CN'),
                    theme: 'auto',
                    widgetName: 'AI 客服',
                    aiNickname: 'AirPilot',
                    enableEscalation: true,
                    enableAttachments: false
                });
            }

            function ensureScript() {
                if (widgetScriptLoaded) {
                    initWidget();
                    return;
                }
                widgetScriptLoaded = true;
                var script = document.createElement('script');
                script.src = '/plugins/ai-support/widget/airpilot-widget.js';
                script.async = true;
                script.onload = initWidget;
                document.head.appendChild(script);
            }

            function tick() {
                if (widgetStarted) return;
                if (!getAuthToken() || !shouldStart()) return;
                ensureScript();
            }

            setInterval(tick, 1000);
            window.addEventListener('hashchange', tick);
            window.addEventListener('load', tick);
            tick();
        })();
    </script>
@endif
@if (file_exists(public_path("/theme/{$theme}/assets/custom.js")))
    <script src="/theme/{{$theme}}/assets/custom.js?v={{$version}}"></script>
@endif
</body>

</html>
