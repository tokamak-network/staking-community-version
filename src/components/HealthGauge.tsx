'use client';

import { L2Metrics } from '@/types';
import { formatTON } from '@/lib/calculations';

interface HealthGaugeProps {
  metrics: L2Metrics;
  simulatedStake?: number; // 시뮬레이터에서 전달받는 추가 스테이킹 양
}

export function HealthGauge({ metrics, simulatedStake = 0 }: HealthGaugeProps) {
  const { network, minRequired, buffer, isEligible } = metrics;
  const totalStaked = network.totalStaked;
  const simulatedTotal = totalStaked + simulatedStake;
  
  // 과포화 기준점 (minRequired의 2배를 기준으로 설정)
  const saturationPoint = minRequired * 2;
  const maxValue = saturationPoint * 1.2; // 게이지 최대값
  
  // 각 구간의 각도 계산 (반원 = 180도)
  // Red Zone: 0 ~ minRequired
  // Green Zone: minRequired ~ saturationPoint
  // Orange Zone: saturationPoint ~ maxValue
  const redZoneAngle = (minRequired / maxValue) * 180;
  const greenZoneAngle = ((saturationPoint - minRequired) / maxValue) * 180;
  const orangeZoneAngle = 180 - redZoneAngle - greenZoneAngle;
  
  // 현재 스테이킹 위치 각도 (0 ~ 180)
  const currentAngle = Math.min((totalStaked / maxValue) * 180, 180);
  const simulatedAngle = Math.min((simulatedTotal / maxValue) * 180, 180);
  
  // 시뮬레이션 후 상태 계산
  const simulatedBuffer = simulatedTotal - minRequired;
  const simulatedIsEligible = simulatedTotal >= minRequired;
  
  // SVG 반원 게이지 계산
  const radius = 80;
  const strokeWidth = 16;
  const centerX = 100;
  const centerY = 90;
  
  // 각도를 라디안으로 변환하고 SVG 좌표 계산
  const getPointOnArc = (angle: number) => {
    const radian = (180 - angle) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY - radius * Math.sin(radian),
    };
  };
  
  // Arc path 생성
  const createArc = (startAngle: number, endAngle: number) => {
    const start = getPointOnArc(startAngle);
    const end = getPointOnArc(endAngle);
    const largeArcFlag = endAngle - startAngle > 90 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };
  
  // 바늘 위치 계산
  const needlePoint = getPointOnArc(currentAngle);
  const simulatedNeedlePoint = getPointOnArc(simulatedAngle);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Staking Health
      </h3>
      
      {/* 반원형 게이지 */}
      <div className="flex justify-center mb-6">
        <svg viewBox="0 0 200 110" className="w-full max-w-xs">
          {/* Red Zone (0 ~ minRequired) */}
          <path
            d={createArc(0, redZoneAngle)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Green Zone (minRequired ~ saturationPoint) */}
          <path
            d={createArc(redZoneAngle, redZoneAngle + greenZoneAngle)}
            fill="none"
            stroke="#22c55e"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
          
          {/* Orange Zone (saturationPoint ~ max) */}
          <path
            d={createArc(redZoneAngle + greenZoneAngle, 180)}
            fill="none"
            stroke="#f97316"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* 구간 마커 - Required */}
          <line
            x1={getPointOnArc(redZoneAngle).x}
            y1={getPointOnArc(redZoneAngle).y - strokeWidth / 2 - 2}
            x2={getPointOnArc(redZoneAngle).x}
            y2={getPointOnArc(redZoneAngle).y + strokeWidth / 2 + 2}
            stroke="#1f2937"
            strokeWidth="2"
            transform={`rotate(${90 - redZoneAngle}, ${getPointOnArc(redZoneAngle).x}, ${getPointOnArc(redZoneAngle).y})`}
          />
          
          {/* 구간 마커 - Saturation */}
          <line
            x1={getPointOnArc(redZoneAngle + greenZoneAngle).x}
            y1={getPointOnArc(redZoneAngle + greenZoneAngle).y - strokeWidth / 2 - 2}
            x2={getPointOnArc(redZoneAngle + greenZoneAngle).x}
            y2={getPointOnArc(redZoneAngle + greenZoneAngle).y + strokeWidth / 2 + 2}
            stroke="#1f2937"
            strokeWidth="2"
            transform={`rotate(${90 - (redZoneAngle + greenZoneAngle)}, ${getPointOnArc(redZoneAngle + greenZoneAngle).x}, ${getPointOnArc(redZoneAngle + greenZoneAngle).y})`}
          />
          
          {/* 시뮬레이션 바늘 (있을 경우) */}
          {simulatedStake > 0 && (
            <>
              <line
                x1={centerX}
                y1={centerY}
                x2={simulatedNeedlePoint.x}
                y2={simulatedNeedlePoint.y}
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="4,4"
              />
              <circle
                cx={simulatedNeedlePoint.x}
                cy={simulatedNeedlePoint.y}
                r="6"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
            </>
          )}
          
          {/* 현재 위치 바늘 */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needlePoint.x}
            y2={needlePoint.y}
            stroke={isEligible ? '#22c55e' : '#ef4444'}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="8"
            fill={isEligible ? '#22c55e' : '#ef4444'}
            stroke="white"
            strokeWidth="3"
          />
          <circle
            cx={needlePoint.x}
            cy={needlePoint.y}
            r="5"
            fill={isEligible ? '#22c55e' : '#ef4444'}
            stroke="white"
            strokeWidth="2"
          />
          
          {/* 라벨 */}
          <text x="20" y="105" className="fill-gray-500 dark:fill-gray-400 text-[8px]">0</text>
          <text x={getPointOnArc(redZoneAngle).x - 15} y="105" className="fill-gray-500 dark:fill-gray-400 text-[8px]">Required</text>
          <text x={getPointOnArc(redZoneAngle + greenZoneAngle).x - 10} y="105" className="fill-gray-500 dark:fill-gray-400 text-[8px]">Saturation</text>
          <text x="170" y="105" className="fill-gray-500 dark:fill-gray-400 text-[8px]">Max</text>
        </svg>
      </div>
      
      {/* Zone 레전드 */}
      <div className="flex justify-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Red (위험)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Green (안정)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Orange (과포화)</span>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Staked</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatTON(totalStaked)} TON
          </p>
          {simulatedStake > 0 && (
            <p className="text-sm text-blue-500 mt-1">
              → {formatTON(simulatedTotal)} TON
            </p>
          )}
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Minimum Required</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatTON(minRequired)} TON
          </p>
        </div>
        <div className={`rounded-lg p-4 ${
          isEligible 
            ? 'bg-green-50 dark:bg-green-900/20' 
            : 'bg-red-50 dark:bg-red-900/20'
        }`}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Safety Buffer</p>
          <p className={`text-xl font-bold ${
            isEligible 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {buffer >= 0 ? '+' : ''}{formatTON(buffer)} TON
          </p>
          {simulatedStake > 0 && (
            <p className={`text-sm mt-1 ${
              simulatedIsEligible ? 'text-green-500' : 'text-red-500'
            }`}>
              → {simulatedBuffer >= 0 ? '+' : ''}{formatTON(simulatedBuffer)} TON
            </p>
          )}
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
          <p className={`text-xl font-bold ${
            isEligible 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {isEligible ? 'Active' : 'Risk'}
          </p>
          {simulatedStake > 0 && !isEligible && simulatedIsEligible && (
            <p className="text-sm text-green-500 mt-1">
              → Active ✓
            </p>
          )}
        </div>
      </div>
      
      {/* Warning message */}
      {!isEligible && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                자격 미달 - 보상 없음
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                이 L2가 보상을 받으려면 {formatTON(Math.abs(buffer))} TON이 더 스테이킹되어야 합니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
