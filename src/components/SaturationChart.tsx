'use client';

import { useMemo } from 'react';
import { L2Metrics } from '@/types';
import { STAKING_CONSTANTS } from '@/data/constants';
import { formatTON, formatPercentage, checkEligibility } from '@/lib/calculations';

interface SaturationChartProps {
  metrics: L2Metrics;
  totalEffectiveBridgedTon: number;
  simulatedStake?: number; // 시뮬레이터에서 전달받는 추가 스테이킹 양
}

export function SaturationChart({ 
  metrics, 
  totalEffectiveBridgedTon,
  simulatedStake = 0 
}: SaturationChartProps) {
  const { L, k, theta } = STAKING_CONSTANTS;
  const { network, isEligible } = metrics;
  
  // 시뮬레이션 후 eligible 여부 계산
  const simulatedTotalStaked = network.totalStaked + simulatedStake;
  const willBeEligible = checkEligibility(simulatedTotalStaked, network.bridgedTon, theta);
  
  // 시뮬레이션 후 totalEffectiveBridgedTon 계산
  const simulatedTotalEffective = useMemo(() => {
    if (simulatedStake <= 0) return totalEffectiveBridgedTon;
    
    // 현재 eligible하지 않지만, 시뮬레이션 후 eligible이 되는 경우
    if (!isEligible && willBeEligible) {
      return totalEffectiveBridgedTon + network.bridgedTon;
    }
    // 이미 eligible인 경우 (변화 없음)
    return totalEffectiveBridgedTon;
  }, [simulatedStake, totalEffectiveBridgedTon, isEligible, willBeEligible, network.bridgedTon]);
  
  // Generate curve points for y(x) = L * (x / (k + x))
  const curvePoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    const maxX = k * 3; // Show up to 3x half-saturation point
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * maxX;
      const y = L * (x / (k + x));
      points.push({ x, y });
    }
    
    return points;
  }, [L, k]);
  
  // Current position on the curve
  const currentY = L * (totalEffectiveBridgedTon / (k + totalEffectiveBridgedTon));
  
  // Simulated position on the curve
  const simulatedY = L * (simulatedTotalEffective / (k + simulatedTotalEffective));
  
  // SVG dimensions
  const width = 400;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Scales
  const maxX = k * 3;
  const scaleX = (x: number) => padding.left + (x / maxX) * chartWidth;
  const scaleY = (y: number) => height - padding.bottom - (y / L) * chartHeight;
  
  // Generate SVG path
  const pathD = useMemo(() => {
    return curvePoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`)
      .join(' ');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curvePoints]);
  
  // Current position coordinates
  const currentPosX = scaleX(totalEffectiveBridgedTon);
  const currentPosY = scaleY(currentY);
  
  // Simulated position coordinates
  const simulatedPosX = scaleX(simulatedTotalEffective);
  const simulatedPosY = scaleY(simulatedY);
  
  // 시뮬레이션으로 인한 변화 여부
  const hasSimulationChange = simulatedStake > 0 && simulatedTotalEffective !== totalEffectiveBridgedTon;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Saturation Curve
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        y(x) = L &times; (x / (k + x)) - 생태계 성장에 따른 수확 체감
      </p>
      
      {/* Chart */}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          <g className="text-gray-200 dark:text-gray-700">
            {[0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={`h-${ratio}`}
                x1={padding.left}
                y1={scaleY(L * ratio)}
                x2={width - padding.right}
                y2={scaleY(L * ratio)}
                stroke="currentColor"
                strokeDasharray="4,4"
              />
            ))}
            {[0.5, 1, 1.5, 2, 2.5, 3].map((ratio) => (
              <line
                key={`v-${ratio}`}
                x1={scaleX(k * ratio)}
                y1={padding.top}
                x2={scaleX(k * ratio)}
                y2={height - padding.bottom}
                stroke="currentColor"
                strokeDasharray="4,4"
              />
            ))}
          </g>
          
          {/* Half-saturation marker (k) */}
          <line
            x1={scaleX(k)}
            y1={padding.top}
            x2={scaleX(k)}
            y2={height - padding.bottom}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
          <text
            x={scaleX(k)}
            y={padding.top - 5}
            textAnchor="middle"
            className="fill-amber-500 text-xs font-medium"
          >
            k (50% saturation)
          </text>
          
          {/* Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* 시뮬레이션 이동 표시 (있을 경우) */}
          {hasSimulationChange && (
            <>
              {/* 이동 경로 표시 */}
              <line
                x1={currentPosX}
                y1={currentPosY}
                x2={simulatedPosX}
                y2={simulatedPosY}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
              
              {/* Simulated position vertical line */}
              <line
                x1={simulatedPosX}
                y1={height - padding.bottom}
                x2={simulatedPosX}
                y2={simulatedPosY}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
              
              {/* Simulated position dot */}
              <circle
                cx={simulatedPosX}
                cy={simulatedPosY}
                r="8"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
              
              {/* Simulated label */}
              <text
                x={simulatedPosX + 12}
                y={simulatedPosY - 10}
                className="fill-blue-600 dark:fill-blue-400 text-xs font-medium"
              >
                Projected
              </text>
            </>
          )}
          
          {/* Current position marker */}
          {isEligible && (
            <>
              {/* Vertical line to current position */}
              <line
                x1={currentPosX}
                y1={height - padding.bottom}
                x2={currentPosX}
                y2={currentPosY}
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
              {/* Current position dot */}
              <circle
                cx={currentPosX}
                cy={currentPosY}
                r="8"
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
              />
              {/* Label */}
              <text
                x={currentPosX + 12}
                y={currentPosY + (hasSimulationChange ? 15 : -10)}
                className="fill-green-600 dark:fill-green-400 text-xs font-medium"
              >
                Current
              </text>
            </>
          )}
          
          {/* Y-axis label */}
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${height / 2})`}
            className="fill-gray-500 dark:fill-gray-400 text-xs"
          >
            Seigniorage (TON)
          </text>
          
          {/* X-axis label */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            className="fill-gray-500 dark:fill-gray-400 text-xs"
          >
            Total Effective Bridged TON
          </text>
          
          {/* Y-axis ticks */}
          {[0, 0.5, 1].map((ratio) => (
            <text
              key={`y-tick-${ratio}`}
              x={padding.left - 5}
              y={scaleY(L * ratio) + 4}
              textAnchor="end"
              className="fill-gray-500 dark:fill-gray-400 text-xs"
            >
              {formatTON(L * ratio)}
            </text>
          ))}
          
          {/* X-axis ticks */}
          {[0, 1, 2, 3].map((ratio) => (
            <text
              key={`x-tick-${ratio}`}
              x={scaleX(k * ratio)}
              y={height - padding.bottom + 15}
              textAnchor="middle"
              className="fill-gray-500 dark:fill-gray-400 text-xs"
            >
              {formatTON(k * ratio)}
            </text>
          ))}
        </svg>
      </div>
      
      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Current x</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatTON(totalEffectiveBridgedTon)}
          </p>
          {hasSimulationChange && (
            <p className="text-sm text-blue-500">
              → {formatTON(simulatedTotalEffective)}
            </p>
          )}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Current y(x)</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatTON(currentY)}
          </p>
          {hasSimulationChange && (
            <p className="text-sm text-blue-500">
              → {formatTON(simulatedY)}
            </p>
          )}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Saturation</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatPercentage((totalEffectiveBridgedTon / (k + totalEffectiveBridgedTon)) * 100, 1)}
          </p>
          {hasSimulationChange && (
            <p className="text-sm text-blue-500">
              → {formatPercentage((simulatedTotalEffective / (k + simulatedTotalEffective)) * 100, 1)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
