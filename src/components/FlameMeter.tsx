type Props = {
  score: number; // 0-100
};

function flameLabel(score: number) {
  if (score >= 90) return { label: "大炎上", color: "text-red-400" };
  if (score >= 70) return { label: "炎上", color: "text-orange-400" };
  if (score >= 50) return { label: "燃え始め", color: "text-yellow-400" };
  if (score >= 30) return { label: "ボヤ", color: "text-yellow-300" };
  return { label: "ほぼ無風", color: "text-green-400" };
}

function barColor(score: number) {
  if (score >= 90) return "bg-red-500";
  if (score >= 70) return "bg-orange-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-green-500";
}

export default function FlameMeter({ score }: Props) {
  const { label, color } = flameLabel(score);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400 font-medium">炎上度</span>
        <span className={`text-sm font-bold ${color}`}>
          {label}（{score}点）
        </span>
      </div>
      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
