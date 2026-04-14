import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

function formatGold(copper: number): string {
  const g = Math.floor(copper / 10000)
  const s = Math.floor((copper % 10000) / 100)
  const c = copper % 100
  return `${g.toLocaleString()}g ${s}s ${c}c`
}

export async function sendSnipeAlert(
  to: string,
  itemName: string,
  currentPrice: number,
  targetPrice: number
): Promise<void> {
  const margin = (((targetPrice - currentPrice) / targetPrice) * 100).toFixed(1)
  const formattedCurrent = formatGold(currentPrice)
  const formattedTarget = formatGold(targetPrice)

  await resend.emails.send({
    from: 'WoW Auction Sniper <alerts@wowsniper.app>',
    to,
    subject: `Snipe Alert: ${itemName} is below your target price!`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Snipe Alert</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #e6e6e6; }
    .container { max-width: 600px; margin: 40px auto; background-color: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%); padding: 32px; text-align: center; border-bottom: 1px solid #30363d; }
    .header h1 { margin: 0; font-size: 24px; color: #c8a84b; letter-spacing: 1px; }
    .header p { margin: 8px 0 0; color: #8b949e; font-size: 14px; }
    .body { padding: 32px; }
    .item-name { font-size: 22px; font-weight: 700; color: #c8a84b; margin-bottom: 24px; }
    .price-box { background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin-bottom: 16px; display: flex; justify-content: space-between; }
    .price-label { font-size: 12px; color: #8b949e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .price-current { font-size: 24px; font-weight: 700; color: #3fb950; }
    .price-target { font-size: 20px; font-weight: 600; color: #c8a84b; }
    .savings { background: rgba(63, 185, 80, 0.1); border: 1px solid rgba(63, 185, 80, 0.3); border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; }
    .savings-pct { font-size: 28px; font-weight: 700; color: #3fb950; }
    .savings-label { font-size: 13px; color: #8b949e; }
    .cta { display: block; text-align: center; background-color: #c8a84b; color: #0d1117; font-weight: 700; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin-bottom: 24px; }
    .footer { padding: 24px 32px; border-top: 1px solid #30363d; text-align: center; font-size: 12px; color: #8b949e; }
    .sword { font-size: 32px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="sword">⚔️</div>
      <h1>WoW AUCTION SNIPER</h1>
      <p>Your snipe alert has triggered</p>
    </div>
    <div class="body">
      <div class="item-name">📦 ${itemName}</div>
      <div class="price-box">
        <div>
          <div class="price-label">Current Price</div>
          <div class="price-current">${formattedCurrent}</div>
        </div>
        <div style="text-align:right">
          <div class="price-label">Your Target</div>
          <div class="price-target">${formattedTarget}</div>
        </div>
      </div>
      <div class="savings">
        <div class="savings-pct">${margin}% below target</div>
        <div class="savings-label">Time to snipe!</div>
      </div>
      <a href="https://wowsniper.app/dashboard" class="cta">View Your Dashboard →</a>
      <p style="color: #8b949e; font-size: 13px; text-align: center; margin: 0;">
        Prices update every ~60 minutes. Act fast before others snipe this deal!
      </p>
    </div>
    <div class="footer">
      <p>You received this alert because you have a watchlist entry for <strong>${itemName}</strong>.</p>
      <p>To stop receiving alerts, <a href="https://wowsniper.app/dashboard" style="color: #c8a84b;">manage your watchlist</a>.</p>
      <p style="margin-top: 12px; color: #6e7681;">Not affiliated with Blizzard Entertainment.</p>
    </div>
  </div>
</body>
</html>
    `,
  })
}
