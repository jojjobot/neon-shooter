'use client'
import { useState } from 'react'

interface Props {
  tier: string
  discordWebhook: string
  apiKey: string | null
}

export default function SettingsForm({ tier, discordWebhook: initialWebhook, apiKey: initialKey }: Props) {
  const isGold = tier === 'GOLD_GOBLIN'

  // Discord webhook state
  const [webhook, setWebhook] = useState(initialWebhook)
  const [webhookSaving, setWebhookSaving] = useState(false)
  const [webhookMsg, setWebhookMsg] = useState('')

  // API key state
  const [apiKey, setApiKey] = useState(initialKey)
  const [keyVisible, setKeyVisible] = useState(false)
  const [keyGenerating, setKeyGenerating] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)

  const saveWebhook = async () => {
    setWebhookSaving(true)
    setWebhookMsg('')
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordWebhook: webhook }),
      })
      const data = await res.json()
      setWebhookMsg(res.ok ? '✓ Saved' : data.error ?? 'Failed to save.')
    } catch {
      setWebhookMsg('Network error.')
    } finally {
      setWebhookSaving(false)
      setTimeout(() => setWebhookMsg(''), 3000)
    }
  }

  const generateKey = async () => {
    if (!confirm('This will invalidate your current API key. Continue?')) return
    setKeyGenerating(true)
    try {
      const res = await fetch('/api/user/apikey', { method: 'POST' })
      const data = await res.json()
      if (res.ok) { setApiKey(data.apiKey); setKeyVisible(true) }
    } finally {
      setKeyGenerating(false)
    }
  }

  const copyKey = () => {
    if (!apiKey) return
    navigator.clipboard.writeText(apiKey)
    setKeyCopied(true)
    setTimeout(() => setKeyCopied(false), 2000)
  }

  return (
    <>
      {/* Discord Webhook */}
      <div className={`wow-card p-6 mb-6 ${!isGold ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-wow-text">💬 Discord Alerts</h2>
          {!isGold && <span className="badge badge-gold text-xs">Gold Goblin</span>}
        </div>
        <p className="text-sm text-wow-muted mb-4">
          Paste your Discord webhook URL to receive snipe alerts in a channel.
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            disabled={!isGold}
            placeholder="https://discord.com/api/webhooks/..."
            value={webhook}
            onChange={(e) => setWebhook(e.target.value)}
            className="flex-1 bg-wow-dark border border-wow-border rounded-md px-3 py-2 text-sm text-wow-text focus:outline-none focus:border-wow-gold disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={saveWebhook}
            disabled={!isGold || webhookSaving}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {webhookSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {webhookMsg && (
          <p className={`mt-2 text-xs ${webhookMsg.startsWith('✓') ? 'text-wow-green' : 'text-wow-red'}`}>
            {webhookMsg}
          </p>
        )}
        {!isGold && (
          <p className="mt-3 text-xs text-wow-muted">
            <a href="/pricing" className="text-wow-gold hover:underline">Upgrade to Gold Goblin</a> to enable Discord alerts.
          </p>
        )}
      </div>

      {/* API Key */}
      <div className={`wow-card p-6 mb-6 ${!isGold ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-wow-text">🔑 API Access</h2>
          {!isGold && <span className="badge badge-gold text-xs">Gold Goblin</span>}
        </div>
        <p className="text-sm text-wow-muted mb-4">
          Use your API key to query price data programmatically.
        </p>

        {isGold ? (
          apiKey ? (
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <code className="flex-1 bg-wow-dark border border-wow-border rounded-md px-3 py-2 text-xs text-wow-text font-mono truncate">
                  {keyVisible ? apiKey : '•'.repeat(48)}
                </code>
                <button
                  onClick={() => setKeyVisible((v) => !v)}
                  className="btn-secondary text-xs px-3 py-2 whitespace-nowrap"
                >
                  {keyVisible ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={copyKey}
                  className="btn-secondary text-xs px-3 py-2 whitespace-nowrap"
                >
                  {keyCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <button
                onClick={generateKey}
                disabled={keyGenerating}
                className="text-xs text-wow-muted hover:text-wow-red transition-colors"
              >
                {keyGenerating ? 'Regenerating…' : '↻ Regenerate key (invalidates current)'}
              </button>
            </div>
          ) : (
            <button
              onClick={generateKey}
              disabled={keyGenerating}
              className="btn-primary text-sm px-4 py-2"
            >
              {keyGenerating ? 'Generating…' : 'Generate API Key'}
            </button>
          )
        ) : (
          <p className="text-xs text-wow-muted">
            <a href="/pricing" className="text-wow-gold hover:underline">Upgrade to Gold Goblin</a> to get API access.
          </p>
        )}
      </div>
    </>
  )
}
