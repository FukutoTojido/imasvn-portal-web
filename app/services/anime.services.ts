import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { DateTime } from "luxon";

export type AnimeDto = {
	id: string;
	title?: string;
	titleJapanese?: string;
	sypnosis?: string;
	time?: DateTime;
	bg?: FileList | string;
};

export type AnimeEpisodeDto = {
	id: number;
	animeId: number;
	title?: string;
	index?: string;
	odr?: number;
	uploadedFiles?: number;
};

type WithEpisode<T> = T & {
	episodes: AnimeEpisodeDto[];
};

export function useGetAnimes() {
	const query = useQuery({
		queryKey: ["anime"],
		queryFn: async () => {
			try {
				const { data } = await axios.get<WithEpisode<AnimeDto>[]>(
					`${import.meta.env.VITE_BACKEND_API}/anime`,
					{ withCredentials: true },
				);
				return data;
			} catch (e) {
				console.error(e);
				return null;
			}
		},
	});

	return query;
}

export function useGetAnime({ id }: { id: number }) {
	const query = useQuery({
		queryKey: ["anime", id],
		queryFn: async () => {
			try {
				const { data } = await axios.get<WithEpisode<AnimeDto>>(
					`${import.meta.env.VITE_BACKEND_API}/anime/${id}`,
					{ withCredentials: true },
				);

				return data;
			} catch (e) {
				console.error(e);
				return null;
			}
		},
	});

	return query;
}

export function useCreateAnime() {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationKey: ["anime"],
		mutationFn: async (formData: Omit<AnimeDto, "id">) => {
			await axios.post(`${import.meta.env.VITE_BACKEND_API}/anime`, formData, {
				withCredentials: true,
			});
			queryClient.invalidateQueries({
				queryKey: ["anime"],
			});
		},
	});

	return mutation;
}

export function useEditAnime({ id }: { id: number }) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationKey: ["anime", id],
		mutationFn: async (formData: Omit<AnimeDto, "id">) => {
			await axios.patch(
				`${import.meta.env.VITE_BACKEND_API}/anime/${id}`,
				formData,
				{
					withCredentials: true,
				},
			);
			queryClient.invalidateQueries({
				queryKey: ["anime", id],
			});
		},
	});

	return mutation;
}

export function useDeleteAnime({ id }: { id: number }) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationKey: ["anime", id],
		mutationFn: async () => {
			await axios.delete(`${import.meta.env.VITE_BACKEND_API}/anime/${id}`, {
				withCredentials: true,
			});
			queryClient.invalidateQueries({ queryKey: ["anime"] });
		},
	});

	return mutation;
}

export function useGetAnimeEpisodes({ id }: { id: number }) {
	const query = useQuery({
		queryKey: ["anime", id, "episode"],
		queryFn: async () => {
			if (!id) return null;
			try {
				const { data: episodes } = await axios.get<AnimeEpisodeDto[]>(
					`${import.meta.env.VITE_BACKEND_API}/anime/${id}/episodes/`,
					{ withCredentials: true },
				);
				return episodes;
			} catch (e) {
				console.error(e);
				return null;
			}
		},
	});

	return query;
}

export function useGetEpisode({
	id,
	episode,
}: {
	id: number | null;
	episode: number | null;
}) {
	const query = useQuery({
		queryKey: ["anime", id, "episode", episode],
		queryFn: async () => {
			try {
				if (id === null || episode === null) return null;

				const { data } = await axios.get<AnimeEpisodeDto>(
					`${import.meta.env.VITE_BACKEND_API}/anime/${id}/episodes/${episode}`,
					{ withCredentials: true },
				);
				return data;
			} catch (e) {
				console.error(e);
				return null;
			}
		},
	});

	return query;
}

export function useCreateEpisode({ id }: { id: number | null }) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationKey: ["anime", id],
		mutationFn: async (formData: Pick<AnimeEpisodeDto, "title" | "index">) => {
			if (id === null) return null;

			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/anime/${id}/episodes`,
				formData,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({ queryKey: ["anime", id] });
		},
	});

	return mutation;
}

export function useEditEpisode({
	id,
	episode,
}: {
	id: number;
	episode: number | null;
}) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationKey: ["anime", id, "episode", episode],
		mutationFn: async (
			formData: Pick<AnimeEpisodeDto, "title" | "index"> & { url?: string },
		) => {
			if (id === null || episode === null) return null;

			await axios.patch(
				`${import.meta.env.VITE_BACKEND_API}/anime/${id}/episodes/${episode}`,
				formData,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["anime", id, "episode", episode],
			});
		},
	});

	return mutation;
}

export function useDeleteEpisode({
	id,
	episode,
}: {
	id: number;
	episode: number | null;
}) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationKey: ["anime", id, "episode", episode],
		mutationFn: async () => {
			if (id === null || episode === null) return null;

			await axios.delete(
				`${import.meta.env.VITE_BACKEND_API}/anime/${id}/episodes/${episode}`,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["anime", id],
			});
		},
	});

	return mutation;
}

export function useDeleteContent({
	id,
	episode,
}: {
	id: number;
	episode: number | null;
}) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () => {
			if (id === null || episode === null) return null;

			await axios.delete(
				`${import.meta.env.VITE_BACKEND_API}/anime/${id}/episodes/${episode}/contents`,
				{ withCredentials: true },
			);

			queryClient.invalidateQueries({
				queryKey: ["anime", id, "episode", episode],
			});
		},
	});

	return mutation;
}
