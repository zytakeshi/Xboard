<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Captcha Verification</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #f3f4f6;
            color: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 16px;
            box-sizing: border-box;
        }

        .card {
            width: 100%;
            max-width: 420px;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
            padding: 24px;
            box-sizing: border-box;
        }

        .title {
            margin: 0 0 8px;
            font-size: 20px;
            font-weight: 600;
        }

        .status {
            margin: 0 0 18px;
            color: #475569;
            font-size: 14px;
            line-height: 1.5;
            min-height: 40px;
        }

        .status.success {
            color: #15803d;
        }

        .status.error {
            color: #b91c1c;
        }

        #challenge-container {
            min-height: 76px;
        }

        .action {
            margin-top: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 0;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            background: #0f766e;
            color: #ffffff;
        }

        .action[hidden] {
            display: none;
        }

        .muted {
            margin-top: 14px;
            color: #64748b;
            font-size: 12px;
        }
    </style>

    @if ($captchaType === 'turnstile')
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    @elseif ($captchaType === 'recaptcha')
        <script src="https://www.recaptcha.net/recaptcha/api.js" async defer></script>
    @elseif ($captchaType === 'recaptcha-v3')
        <script src="https://www.recaptcha.net/recaptcha/api.js?render={{ $siteKey }}" async defer></script>
    @endif
</head>
<body>
<div class="card">
    <h1 class="title">Security Verification</h1>
    <p id="status" class="status">Complete the captcha challenge to continue.</p>
    <div id="challenge-container"></div>
    <button id="retry-button" class="action" hidden type="button">Retry</button>
    <div class="muted">After verification completes, return to the app.</div>
</div>

<script>
(() => {
    const sessionId = @json($sessionId);
    const captchaType = @json($captchaType);
    const siteKey = @json($siteKey);
    const verifyEndpoint = @json($verifyEndpoint);

    const statusElement = document.getElementById('status');
    const retryButton = document.getElementById('retry-button');
    const challengeContainer = document.getElementById('challenge-container');

    let recaptchaWidgetId = null;
    let turnstileWidgetId = null;

    const setStatus = (message, style = 'default') => {
        statusElement.textContent = message;
        statusElement.classList.remove('success', 'error');
        if (style === 'success') statusElement.classList.add('success');
        if (style === 'error') statusElement.classList.add('error');
    };

    const waitFor = (predicate, onReady, timeoutMessage) => {
        let attempts = 0;
        const timer = setInterval(() => {
            attempts += 1;
            if (predicate()) {
                clearInterval(timer);
                onReady();
                return;
            }
            if (attempts > 120) {
                clearInterval(timer);
                setStatus(timeoutMessage, 'error');
                retryButton.hidden = false;
            }
        }, 100);
    };

    const verifyToken = async (token) => {
        if (!token) {
            setStatus('Verification token is missing.', 'error');
            retryButton.hidden = false;
            return;
        }

        setStatus('Verifying challenge...');
        retryButton.hidden = true;

        const payload = {
            session_id: sessionId,
        };

        if (captchaType === 'turnstile') {
            payload.turnstile_token = token;
        } else if (captchaType === 'recaptcha-v3') {
            payload.recaptcha_v3_token = token;
        } else {
            payload.recaptcha_data = token;
        }

        try {
            const response = await fetch(verifyEndpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok || result.status !== 'success') {
                throw new Error(result.message || 'Verification failed');
            }

            setStatus('Verification complete. You can return to the app.', 'success');
            document.body.setAttribute('data-captcha-verified', 'true');
            retryButton.hidden = true;
        } catch (error) {
            const message = error && error.message ? error.message : 'Verification failed';
            setStatus(message, 'error');
            retryButton.hidden = false;
        }
    };

    const startRecaptchaV3 = () => {
        if (!window.grecaptcha) {
            setStatus('reCAPTCHA is still loading. Please retry.', 'error');
            retryButton.hidden = false;
            return;
        }

        setStatus('Completing verification...');
        window.grecaptcha.ready(() => {
            window.grecaptcha
                .execute(siteKey, { action: 'captcha_session' })
                .then((token) => verifyToken(token))
                .catch(() => {
                    setStatus('reCAPTCHA failed to execute.', 'error');
                    retryButton.hidden = false;
                });
        });
    };

    const startTurnstile = () => {
        waitFor(
            () => typeof window.turnstile !== 'undefined',
            () => {
                turnstileWidgetId = window.turnstile.render('#challenge-container', {
                    sitekey: siteKey,
                    callback: (token) => verifyToken(token),
                    'error-callback': () => {
                        setStatus('Turnstile validation failed. Please retry.', 'error');
                        retryButton.hidden = false;
                    },
                    'expired-callback': () => {
                        setStatus('Turnstile challenge expired. Please retry.', 'error');
                        retryButton.hidden = false;
                    }
                });
            },
            'Turnstile failed to load. Please retry.'
        );
    };

    const startRecaptcha = () => {
        waitFor(
            () => typeof window.grecaptcha !== 'undefined',
            () => {
                recaptchaWidgetId = window.grecaptcha.render('challenge-container', {
                    sitekey: siteKey,
                    callback: (token) => verifyToken(token),
                    'error-callback': () => {
                        setStatus('reCAPTCHA validation failed. Please retry.', 'error');
                        retryButton.hidden = false;
                    },
                    'expired-callback': () => {
                        setStatus('reCAPTCHA challenge expired. Please retry.', 'error');
                        retryButton.hidden = false;
                    }
                });
            },
            'reCAPTCHA failed to load. Please retry.'
        );
    };

    const startChallenge = () => {
        retryButton.hidden = true;

        if (!sessionId || !captchaType || !siteKey || !verifyEndpoint) {
            setStatus('Captcha session is invalid. Please return to the app.', 'error');
            return;
        }

        if (captchaType === 'turnstile') {
            startTurnstile();
            return;
        }

        if (captchaType === 'recaptcha-v3') {
            startRecaptchaV3();
            return;
        }

        if (captchaType === 'recaptcha') {
            startRecaptcha();
            return;
        }

        setStatus('Unsupported captcha type.', 'error');
    };

    retryButton.addEventListener('click', () => {
        retryButton.hidden = true;
        if (captchaType === 'recaptcha' && window.grecaptcha && recaptchaWidgetId !== null) {
            setStatus('Please complete the challenge again.');
            window.grecaptcha.reset(recaptchaWidgetId);
            return;
        }

        if (captchaType === 'turnstile' && window.turnstile && turnstileWidgetId !== null) {
            setStatus('Please complete the challenge again.');
            window.turnstile.reset(turnstileWidgetId);
            return;
        }

        startChallenge();
    });

    window.addEventListener('load', startChallenge);
})();
</script>
</body>
</html>
