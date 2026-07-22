import { useGetChannels } from "~/services/live.services";
import AddChannel from "./AddChannel";
import UpdateChannel from "./UpdateChannel";

export default function Channels({
	slug,
	broadcast_id,
}: {
	slug?: string;
	broadcast_id?: number;
}) {
	const { data, isLoading, error } = useGetChannels(slug, broadcast_id);

	return (
		<div className="w-full flex flex-wrap gap-2">
			{data?.map((channel) => (
				<UpdateChannel data={channel} key={channel.id} />
			))}
			<AddChannel slug={slug} broadcast_id={broadcast_id}/>
		</div>
	);
}
