// components/StakingDashboard.jsx
import Info from "./Infos";
import Candidates from "./Candidates";

export default function StakingDashboard() {
	return (
		<div className="max-w-screen-xl p-4 flex flex-row h-full justify-start items-start font-titillium-web">
			<div className="flex flex-col justify-center items-center mr-[100px] h-[1056px]">
				<Info />
			</div>
			<div className="mt-8 min-w-[510px]">
				<Candidates />
			</div>
		</div>
	);
}
