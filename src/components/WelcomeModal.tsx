"use client";

type Props = {
  onClose: () => void;
};

export default function WelcomeModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🔥</div>
          <h2 className="text-xl font-bold">炎上.com へようこそ！</h2>
          <p className="text-gray-400 text-sm mt-1">
            あなたの投稿がどれだけ炎上するかをAIがシミュレート。謝罪で鎮火を目指せ！
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 mb-4 space-y-1.5">
          <p className="text-xs font-bold text-gray-300 mb-2">遊び方</p>
          <p className="text-sm text-gray-300">💬 投稿する（最大5回）</p>
          <p className="text-sm text-gray-300">🔥 自分の投稿を炎上させる（最大3回）</p>
          <p className="text-sm text-gray-300">🙇 謝罪して炎上を鎮める</p>
          <p className="text-sm text-gray-300">📸 「シェア」ボタンで結果を画像保存・共有</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 mb-4 space-y-1.5">
          <p className="text-xs font-bold text-gray-300 mb-2">🎮 楽しく遊ぶために</p>
          <p className="text-xs text-gray-400">実はどんな投稿でもAIが必ず炎上させます。「絶対炎上しないだろ」な投稿ほど意外な角度から燃えるのが見どころ。</p>
          <p className="text-sm text-gray-300 mt-2">🔥 <span className="font-semibold">大炎上を狙う</span> — 過激な発言でスコア100点を目指せ</p>
          <p className="text-sm text-gray-300">🌿 <span className="font-semibold">低スコアを狙う</span> — どうすれば燃えにくい？限界を探れ</p>
          <p className="text-sm text-gray-300">😂 <span className="font-semibold">意外性を楽しむ</span> — 「なんでそこで炎上！？」を味わえ</p>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-sm text-red-400 font-bold">⛔️ 実在の人物や特定のグループを傷つける投稿は絶対にやめてください</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 mb-5 space-y-1.5">
          <p className="text-xs font-bold text-gray-300 mb-2">注意事項</p>
          <p className="text-xs text-gray-400">• これはシミュレーターです。AIのコメントは架空のものです</p>
          <p className="text-xs text-gray-400">• 投稿は炎上後に他のユーザーにも表示されます</p>
          <p className="text-xs text-gray-400">• 実名・個人情報は入力しないでください</p>
          <p className="text-xs text-orange-400 font-medium">⚠️ AIが辛辣なコメントを生成します。メンタルが弱い方はご遠慮ください</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-full transition-colors"
        >
          理解した！はじめる 🔥
        </button>
      </div>
    </div>
  );
}
