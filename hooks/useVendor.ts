import { useState } from "react";
import useSWR from "swr";
import { api } from "../utils/api";

export const useVendor = () => {
	const [vendors, setVendors] = useState<{
		data: Vendor[];
		meta: Record<string, string | number>;
	}>();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchVendors = (vendor: Partial<Vendor>) => {
		const { data, error, isLoading } = useSWR<{
			data: Vendor[];
			meta: Record<string, string | number>;
		}>("vendors", (url: string) =>
			api
				.get<{
					data: Vendor[];
					meta: Record<string, string | number>;
				}>(url)
				.then((res) => res)
		);

		setIsLoading(isLoading);
		setVendors(data);
		setError(error);
	};

	return {
		vendors,
		fetchVendors,
		isLoading,
		error,
	};
};
