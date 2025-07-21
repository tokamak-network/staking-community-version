import { QueryClient } from "@tanstack/react-query";

export function getQueryClient() {
	const queryClient = new QueryClient();
	return queryClient;
}
