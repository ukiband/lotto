interface LottoBallProps {
  number: number
  isBonus?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// 로또 공식 색상
function getBallColor(n: number): string {
  if (n <= 10) return 'bg-yellow-400 text-yellow-900'
  if (n <= 20) return 'bg-blue-500 text-white'
  if (n <= 30) return 'bg-red-500 text-white'
  if (n <= 40) return 'bg-gray-500 text-white'
  return 'bg-green-500 text-white'
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-lg',
  lg: 'w-14 h-14 text-xl',
}

export function LottoBall({ number, isBonus, size = 'md' }: LottoBallProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizeMap[size]} ${getBallColor(number)} rounded-full flex items-center justify-center font-bold shadow-lg ${
          isBonus ? 'ring-2 ring-yellow-300 ring-offset-2 ring-offset-gray-900' : ''
        }`}
      >
        {number}
      </div>
      {isBonus && <span className="text-[10px] text-yellow-300 font-medium">보너스</span>}
    </div>
  )
}
