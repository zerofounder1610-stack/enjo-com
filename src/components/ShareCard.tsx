import type { PostState } from "@/app/page";

type Props = { post: PostState };

const FONT = '"Hiragino Sans", "Noto Sans JP", "Meiryo", sans-serif';

function scoreColor(score: number) {
  if (score >= 80) return "#ff2200";
  if (score >= 60) return "#ff5500";
  if (score >= 40) return "#ff8800";
  return "#ffaa00";
}

export default function ShareCard({ post }: Props) {
  const score = post.flameResult?.flameScore ?? 0;
  const summary = post.flameResult?.summary ?? "";
  const topComments = [...(post.flameResult?.comments ?? [])]
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 5);
  const col = scoreColor(score);

  return (
    <div style={{
      width: 540,
      height: 960,
      background: "#080000",
      color: "#ffffff",
      fontFamily: FONT,
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* 速報バナー */}
      <div style={{
        background: "linear-gradient(90deg, #bb0000, #ff2200)",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🔥</span>
          <span style={{ fontWeight: "bold", fontSize: 20, letterSpacing: 6, color: "#fff" }}>
            炎 上 速 報
          </span>
        </div>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", letterSpacing: 1 }}>
          炎上.com
        </span>
      </div>

      {/* 上部罫線 */}
      <div style={{ height: 3, background: "linear-gradient(90deg, #ff2200, #ff8800, #ff2200)", flexShrink: 0 }} />

      {/* スコアエリア */}
      <div style={{
        padding: "48px 24px 40px",
        textAlign: "center",
        background: "linear-gradient(180deg, #130000 0%, #080000 100%)",
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 12, color: "#ff6644", letterSpacing: 8, marginBottom: 10 }}>
          ━━  炎 上 ス コ ア  ━━
        </div>
        <div style={{
          fontSize: 130,
          fontWeight: "bold",
          color: col,
          lineHeight: 1,
          textShadow: `0 0 60px ${col}bb, 0 0 120px ${col}55`,
        }}>
          {score}
        </div>
        <div style={{ fontSize: 20, color: "#ff9977", letterSpacing: 4, marginTop: 8 }}>
          点
        </div>
      </div>

      {/* 罫線 */}
      <div style={{ height: 1, background: "#2a0000", margin: "0 24px", flexShrink: 0 }} />

      {/* 発言内容 */}
      <div style={{ padding: "24px 24px 20px", flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: "#884444", letterSpacing: 4, marginBottom: 10 }}>
          ■ 問題の発言
        </div>
        <div style={{
          background: "rgba(255,50,0,0.07)",
          border: "1px solid rgba(255,50,0,0.2)",
          borderLeft: `4px solid ${col}`,
          borderRadius: "0 10px 10px 0",
          padding: "16px 18px",
          fontSize: 17,
          lineHeight: 1.8,
          color: "#eeeeee",
        }}>
          {post.content.length > 110
            ? `「${post.content.slice(0, 110)}…」`
            : `「${post.content}」`}
        </div>
        {summary && (
          <div style={{ marginTop: 14, fontSize: 13, color: "#aa6655", lineHeight: 1.7 }}>
            {summary}
          </div>
        )}
      </div>

      {/* ネットの反応 */}
      {topComments.length > 0 && (
        <div style={{ padding: "0 24px 20px", flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 11, color: "#884444", letterSpacing: 4, marginBottom: 12 }}>
            ■ ネットの反応（上位{topComments.length}件）
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topComments.map((c, i) => (
              <div key={i} style={{
                background: i === 0 ? "rgba(200,30,0,0.18)" : "rgba(255,255,255,0.04)",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 13,
                color: "#dddddd",
                lineHeight: 1.6,
                borderLeft: i === 0 ? "3px solid #ff3300" : "3px solid #333",
              }}>
                <span style={{ color: i === 0 ? "#ff7755" : "#888", fontSize: 11, fontWeight: "bold" }}>
                  {c.username}
                </span>
                <br />
                {c.text.length > 75 ? `${c.text.slice(0, 75)}…` : c.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 謝罪結果 */}
      {post.apologyResult && (
        <div style={{
          margin: "0 24px 20px",
          padding: "14px 18px",
          borderRadius: 10,
          textAlign: "center",
          fontSize: 15,
          background: post.apologyResult.succeeded ? "rgba(0,80,200,0.18)" : "rgba(200,0,0,0.18)",
          color: post.apologyResult.succeeded ? "#88aaff" : "#ff7755",
          border: `1px solid ${post.apologyResult.succeeded ? "rgba(80,120,255,0.3)" : "rgba(255,80,50,0.3)"}`,
          flexShrink: 0,
        }}>
          {post.apologyResult.succeeded ? "💧 謝罪により鎮火成功" : "🔥 現在も炎上継続中"}
          <span style={{ fontSize: 11, marginLeft: 10, opacity: 0.7 }}>
            鎮火スコア {post.apologyResult.extinguishScore}点
          </span>
        </div>
      )}

      {/* フッター */}
      <div style={{
        borderTop: "1px solid #1a0000",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, color: "#553333", letterSpacing: 1 }}>
          SNS炎上シミュレーター
        </span>
        <span style={{ fontSize: 13, color: "#aa3300", fontWeight: "bold", letterSpacing: 3 }}>
          炎上.com
        </span>
      </div>
    </div>
  );
}
