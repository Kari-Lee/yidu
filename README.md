# 已读 Yidu

> Ta不是不爱你 — 是你们都有病

AI-powered relationship & attachment style analysis tool.

**Live**: [yidu.click](https://yidu.click)

## Features

- 🧪 **Attachment Style Quiz** — 24 questions, brutally honest results
- 🩺 **Chat Diagnosis** — Upload chat logs/screenshots for AI analysis
- 🔮 **Subtext Decoder** — What they *really* mean
- 💊 **Send or Not** — Should you send that message?
- 🔭 **Prediction** — Where is this relationship going?
- 🌙 **Tarot** — Three-card love reading
- 🏮 **Love Oracle** — Traditional fortune sticks
- 💫 **Zodiac Match** — Birthday compatibility
- 🌙 **Daily Fortune** — Today's love energy

## Tech Stack

- **Frontend**: React 19 + Vite 8 + Tailwind CSS v4 + React Router
- **Backend**: Vercel Serverless Functions
- **AI**: Multi-provider adapter (Qwen / Claude / OpenAI)
- **i18n**: react-i18next (Chinese + English)
- **Deploy**: Vercel

## Project Structure

```
src/
├── App.jsx                 # Router config
├── main.jsx                # Entry point
├── app.css                 # Tailwind + custom animations
├── components/
│   ├── Layout.jsx          # Header, footer, lang toggle
│   ├── Shared.jsx          # TCard, ShareBar, LoadingSkeleton
│   └── AIInput.jsx         # Image upload, type selector
├── pages/
│   ├── Home.jsx            # Landing page
│   ├── Quiz.jsx            # Attachment style quiz
│   ├── Diagnose.jsx        # Chat diagnosis (AI)
│   ├── Translate.jsx       # Subtext decoder (AI)
│   ├── Check.jsx           # Send-or-not checker (AI)
│   ├── Predict.jsx         # Relationship predictor (AI)
│   ├── Tarot.jsx           # Tarot card reading
│   ├── Qian.jsx            # Love oracle sticks
│   ├── Bazi.jsx            # Birthday compatibility
│   ├── Fortune.jsx         # Daily fortune
│   ├── Privacy.jsx         # Privacy policy
│   └── NotFound.jsx        # 404 page
├── data/                   # Pure data + calculation logic
│   ├── colors.js           # Design tokens
│   ├── quiz.js             # Quiz questions + type definitions
│   ├── quotes.js           # Daily quotes
│   ├── tarot.js            # Tarot cards + synthesis
│   ├── qian.js             # Oracle fortune sticks
│   ├── bazi.js             # Bazi compatibility calc
│   ├── fortune.js          # Daily fortune calc
│   └── prompts.js          # AI system prompts
├── hooks/
│   └── useAI.js            # AI call state management
├── lib/
│   └── api.js              # API client with retry logic
└── i18n/
    ├── index.js            # i18next config
    ├── zh.json             # Chinese UI strings
    └── en.json             # English UI strings
api/
├── chat.js                 # Serverless: Qwen / Claude / OpenAI adapter
├── feedback.js             # Redacted serve/copy/rating feedback collector
└── oss-policy.js           # Signed direct-upload policy
```

## Development

```bash
npm install
npm run dev
```

## Environment Variables (Vercel)

| Variable | Description | Example |
|---|---|---|
| `AI_PROVIDER` | AI backend: `qwen`, `claude`, or `openai` | `qwen` |
| `QWEN_API_KEY` | DashScope API key (recommended for Qwen) | `sk-...` |
| `ANTHROPIC_API_KEY` | Claude API key or legacy provider key | `sk-...` |
| `API_BASE_URL` | Custom API endpoint (optional) | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `AI_TEXT_MODEL` | Text analysis model override (optional). Use a text model, not a VL model, for normal chat tasks. | `qwen-plus` |
| `AI_FAST_TEXT_MODEL` | Fast text model fallback for lightweight tasks (optional) | `qwen-plus` |
| `AI_MISREAD_MODEL` | Fast model for 已读乱回 and review tasks (optional) | `qwen-plus` |
| `AI_VISION_MODEL` | Screenshot analysis model override (optional) | `qwen3-vl-flash` |
| `AI_FAST_TIMEOUT_MS` | Timeout for lightweight text tasks (optional) | `45000` |
| `AI_TEXT_TIMEOUT_MS` | Timeout for deeper text analysis tasks (optional) | `60000` |
| `AI_VISION_TIMEOUT_MS` | Timeout for screenshot analysis tasks (optional) | `75000` |
| `AI_MODEL` | Legacy provider model override for Claude/OpenAI only | `gpt-4o` |
| `OSS_ACCESS_KEY_ID` | RAM user AccessKey ID for temporary screenshot objects | `LTAI...` |
| `OSS_ACCESS_KEY_SECRET` | RAM user AccessKey Secret | `...` |
| `OSS_BUCKET` | Private OSS bucket name | `yidu-private` |
| `OSS_ENDPOINT` | Bucket endpoint without protocol | `oss-cn-hangzhou.aliyuncs.com` |
| `OSS_OBJECT_PREFIX` | Temporary object prefix (optional) | `yidu-temp/` |
| `OSS_FEEDBACK_PREFIX` | Long-lived redacted feedback prefix (optional) | `yidu-feedback/` |
| `FEEDBACK_HASH_SECRET` | Secret used to hash duplicate source messages | `random-long-secret` |

For screenshot direct upload, grant the RAM user only `oss:PutObject` and
`oss:GetObject` access to `<bucket>/yidu-temp/*`. Configure an OSS lifecycle
rule to delete `yidu-temp/` objects after one day. Add the bucket host to the
WeChat Mini Program `uploadFile` domain allowlist.

For Qwen production speed, keep normal text tasks on `qwen-plus` or another
text-only model. Screenshot tasks use `AI_VISION_MODEL`; setting
`AI_TEXT_MODEL` to a VL model will make non-image features feel much slower.

For the feedback flywheel, also grant `oss:PutObject` to
`<bucket>/yidu-feedback/*`. Do not apply the temporary screenshot lifecycle
rule to this prefix. The endpoint strips common phone numbers, email addresses,
account IDs, URLs, mentions, and long numeric identifiers before persistence.

### For overseas deployment:
```
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-sonnet-4-20250514
```

## License

MIT
