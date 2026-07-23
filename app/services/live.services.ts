import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export type LiveEventDto = {
	slug: string;
	name: string | null;
	ip_slug: string | null;
	event_slug: string | null;
	date: string | null;
	thumbnail: string | null;
	public: boolean | null;
};

export function useGetLives() {
	const query = useQuery({
		queryKey: ["live"],
		queryFn: async () => {
			const { data } = await axios.get<LiveEventDto[]>(
				`${import.meta.env.VITE_BACKEND_API}/live/events`,
				{ withCredentials: true },
			);

			return data;
		},
	});

	return query;
}

export function useGetLive(slug: string) {
	const query = useQuery({
		queryKey: ["live", slug],
		queryFn: async () => {
			const { data } = await axios.get<LiveEventDto>(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}`,
				{ withCredentials: true },
			);

			return data;
		},
	});

	return query;
}

export function useAddLive() {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (body: Pick<LiveEventDto, "slug" | "name">) => {
			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/live/events`,
				body,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["live"],
			});
		},
	});

	return mutation;
}

export function useImportLive() {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (body: Pick<LiveEventDto, "slug">) => {
			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/live/events/import`,
				body,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["live"],
			});
		},
	});

	return mutation;
}

export function useUpdateLive(slug?: string) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (body: Omit<LiveEventDto, "slug">) => {
			if (!slug) return;

			await axios.patch(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}`,
				body,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["live", slug],
			});
		},
	});

	return mutation;
}

export function useDeleteLive(slug?: string) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () => {
			if (!slug) return;

			await axios.delete(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}`,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["live"],
			});
		},
	});

	return mutation;
}

export type LiveArchiveDto = {
	event_id: string;
	id?: number;
	broadcast_slug?: string;
	broadcast_name?: string;
	broadcast_date?: string | null;
};

export function useGetArchives(slug?: string) {
	const query = useQuery({
		queryKey: ["archive", slug],
		queryFn: async () => {
			if (!slug) return [];

			const { data } = await axios.get<LiveArchiveDto[]>(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}/archives`,
				{ withCredentials: true },
			);

			return data;
		},
	});

	return query;
}

export function useGetArchive(slug?: string, broadcast_id?: number) {
	const query = useQuery({
		queryKey: ["archive", slug, broadcast_id],
		queryFn: async () => {
			if (!slug || (!broadcast_id && typeof broadcast_id !== "number"))
				return null;

			const { data } = await axios.get<LiveArchiveDto>(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}/archives/${broadcast_id}`,
				{ withCredentials: true },
			);

			return data;
		},
	});

	return query;
}

export function useAddArchive(slug?: string) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (body: Omit<LiveArchiveDto, "id" | "event_id">) => {
			if (!slug) return;

			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}/archives`,
				body,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["archive", slug],
			});
		},
	});

	return mutation;
}

export function useRefreshArchive(slug?: string, broadcast_id?: number) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () => {
			if (!slug || (!broadcast_id && typeof broadcast_id !== "number")) return;

			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}/archives/${broadcast_id}/refresh`,
				undefined,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["archive", slug, broadcast_id],
			});
			queryClient.invalidateQueries({
				queryKey: ["channel", slug, broadcast_id],
			});
		},
	});

	return mutation;
}

export function useUpdateArchive(slug?: string, broadcast_id?: number) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (body: Omit<LiveArchiveDto, "id" | "event_id">) => {
			if (!slug || (!broadcast_id && typeof broadcast_id !== "number")) return;

			await axios.patch(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}/archives/${broadcast_id}`,
				body,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["archive", slug, broadcast_id],
			});
		},
	});

	return mutation;
}

export function useDeleteArchive(slug?: string, broadcast_id?: number) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () => {
			if (!slug || (!broadcast_id && typeof broadcast_id !== "number")) return;

			await axios.delete(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}/archives/${broadcast_id}`,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["archive", slug],
			});
		},
	});

	return mutation;
}

export type LiveChannelDto = {
	event_id: string;
	broadcast_id: number;
	id?: number;
	channel_id?: string;
	channel_name?: string;
	stream_type?: "hls" | "dash" | "whep";
	url?: string;
	forward_url?: string;
	cookies?: string;
	headers?: string;
	archive?: boolean;
};

export function useGetChannels(slug?: string, broadcast_id?: number) {
	const query = useQuery({
		queryKey: ["channel", slug, broadcast_id],
		queryFn: async () => {
			if (!slug || (!broadcast_id && typeof broadcast_id !== "number"))
				return [];

			const { data } = await axios.get<LiveChannelDto[]>(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}/archives/${broadcast_id}/channels`,
				{ withCredentials: true },
			);

			return data;
		},
	});

	return query;
}

export function useGetChannel(
	slug?: string,
	broadcast_id?: number,
	id?: number,
) {
	const query = useQuery({
		queryKey: ["channel", slug, broadcast_id, id],
		queryFn: async () => {
			if (
				!slug ||
				(!broadcast_id && typeof broadcast_id !== "number") ||
				(!id && typeof id !== "number")
			)
				return null;

			const { data } = await axios.get<LiveChannelDto>(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}/archives/${broadcast_id}/channels/${id}`,
				{ withCredentials: true },
			);

			return data;
		},
	});

	return query;
}

export function useAddChannel(slug?: string, broadcast_id?: number) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (
			body: Pick<LiveChannelDto, "channel_id" | "channel_name">,
		) => {
			if (!slug || (!broadcast_id && typeof broadcast_id !== "number")) return;

			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}/archives/${broadcast_id}/channels`,
				body,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["channel", slug, broadcast_id],
			});
		},
	});

	return mutation;
}

export function useUpdateChannel(
	slug?: string,
	broadcast_id?: number,
	id?: number,
) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (
			body: Omit<LiveChannelDto, "id" | "event_id" | "broadcast_id">,
		) => {
			if (
				!slug ||
				(!broadcast_id && typeof broadcast_id !== "number") ||
				(!id && typeof id !== "number")
			)
				return;

			await axios.patch(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}/archives/${broadcast_id}/channels/${id}`,
				body,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["channel", slug, broadcast_id, id],
			});
		},
	});

	return mutation;
}

export function useDeleteChannel(
	slug?: string,
	broadcast_id?: number,
	id?: number,
) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () => {
			if (
				!slug ||
				(!broadcast_id && typeof broadcast_id !== "number") ||
				(!id && typeof id !== "number")
			)
				return;

			await axios.delete(
				`${import.meta.env.VITE_BACKEND_API}/live/events/${slug}/archives/${broadcast_id}/channels/${id}`,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["channel", slug, broadcast_id],
			});
		},
	});

	return mutation;
}
