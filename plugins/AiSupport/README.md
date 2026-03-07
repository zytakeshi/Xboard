# AiSupport

Installable Xboard plugin for AirPilot.

What it provides:

- AirPilot connector endpoints under `/api/v1/ai-connector/*`
- Xboard user widget proxy endpoints under `/api/v1/user/ai-support/*`
- optional admin helper endpoints under `/api/v1/admin/ai-support/*`
- ticket and knowledge sync observers
- automatic frontend widget bootstrap through theme `custom_html`

What it does not require:

- editing Xboard core files
- editing theme blade files manually
- manual copying of widget assets into `public/`

Required configuration:

- `service_url`
- `vendor_id`
- `api_key`
- `api_secret`
- `connector_key`
- `connector_secret`

Recommended same-host deployment:

- Xboard -> AirPilot: `http://127.0.0.1:8100`
- AirPilot -> Xboard callback: `http://<origin>:7001/api/v1`

See the main vendor guide in AirPilot:

- `/Users/matsumototakeshi/gitrepo/AirPilot/docs/vendors/README.md`
