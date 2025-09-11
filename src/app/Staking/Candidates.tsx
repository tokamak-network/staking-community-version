"use client";
import { useEffect, useRef, useState } from "react";
import useCallOperators from "@/hooks/staking/useCallOperators";
import React from "react";
import { OperatorItem } from "./components/OperatorItem";
import { LoadingDots } from "@/components/Loader/LoadingDots";

const Candidates: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [mounted, setMounted] = useState(false);
	const { operatorsList, loading } = useCallOperators();
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const filteredOperators = operatorsList.filter((op) =>
		op.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const minItems = 30;
	const baseOperators =
		filteredOperators.length < minItems
			? Array(minItems).fill(filteredOperators).flat().slice(0, minItems)
			: filteredOperators;

	const repeatedOperators = [
		...baseOperators,
		...baseOperators,
		...baseOperators,
	];

	useEffect(() => {
		if (!mounted) return;
		const container = scrollContainerRef.current;
		if (!container) return;

		const totalHeight = container.scrollHeight;
		const segment = totalHeight / 3;
		container.scrollTop = segment;

		const onScroll = () => {
			const top = container.scrollTop;
			if (top < segment) {
				setTimeout(() => {
					container.scrollTop = top + segment;
				}, 0);
			} else if (top >= segment * 2) {
				setTimeout(() => {
					container.scrollTop = top - segment;
				}, 0);
			}
		};

		container.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			container.removeEventListener("scroll", onScroll);
		};
	}, [mounted, baseOperators.length]);

	if (!mounted) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="h-[1056px] mx-auto px-4 relative">
			<div
				ref={scrollContainerRef}
				className="h-[1056px] max-h-[1056px] overflow-y-auto mt-6 relative pt-10 pb-10 scrollbar-hide"
				style={{
					scrollbarWidth: "none", // hide scrollbar for Firefox
					msOverflowStyle: "none", // hide scrollbar for IE/Edge
					willChange: "scroll-position",
					overscrollBehavior: "none",
				}}
			>
				<div
					className="w-full flex flex-col"
					style={{ willChange: "transform" }}
				>
					{loading ? (
						<div className="flex justify-center items-center h-[856px]">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2a72e5]"></div>
						</div>
					) : (
						repeatedOperators.map((operator, index) => (
							<OperatorItem key={index} operator={operator} />
						))
					)}
				</div>
			</div>
			{/* Top gradient overlay */}
			<div
				className="absolute top-0 left-0 right-0 h-[300px] pointer-events-none z-[2]"
				style={{
					background: "linear-gradient(to bottom, rgba(250,251,252,1) 0%, rgba(250,251,252,0.9) 30%, rgba(250,251,252,0.5) 60%, transparent 100%)"
				}}
			/>
			{/* Bottom gradient overlay */}
			<div
				className="absolute bottom-0 left-0 right-0 h-[300px] pointer-events-none z-[2]"
				style={{
					background: "linear-gradient(to top, rgba(250,251,252,1) 0%, rgba(250,251,252,0.9) 30%, rgba(250,251,252,0.5) 60%, transparent 100%)"
				}}
			/>
		</div>
	);
};

export default Candidates;
