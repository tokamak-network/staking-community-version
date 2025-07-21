import { SupportedChainId } from "@/types/network/supportedNetwork";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function useConnectWallet() {
	const { connector, isConnected, address } = useAccount();
	const { connect, connectors, error } = useConnect();
	const { disconnect } = useDisconnect();

	const connectToWallet = () => {
		connect({
			connector: connectors[0],
		});
	};

	const disconnectToWallet = () => {
		disconnect();
	};

	const connetAndDisconntWallet = () => {
		isConnected ? disconnect() : connectToWallet();
	};

	return { connectToWallet, disconnectToWallet, connetAndDisconntWallet };
}
