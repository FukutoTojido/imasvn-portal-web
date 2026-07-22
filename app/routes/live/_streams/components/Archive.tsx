import { RiArrowRightSLine } from "@remixicon/react";
import { Loader2 } from "lucide-react";
import { DateTime } from "luxon";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { type LiveEventDto, useGetArchives } from "~/services/live.services";

const ArchiveSelector = ({ data: { slug } }: { data: LiveEventDto }) => {
	const { data, isLoading, error } = useGetArchives(slug);

	return (
		<div className="flex flex-col gap-2">
			{data && data.length === 0 && (
				<div className="w-full py-20 text-center">No Result</div>
			)}
			{error && (
				<div className="w-full py-20 text-center">Cannot find sections</div>
			)}
			{isLoading && (
				<div className="w-full py-20 text-center">
					<Loader2 className="animate-spin mx-auto text-4xl" />
				</div>
			)}
			{data?.map((archive) => (
				<Link
					key={archive.id}
					to={`/_streams/${slug}/archives/${archive.id}`}
					className={buttonVariants({
						variant: "outline",
						className: "w-full py-2 px-3 flex items-center h-max text-left",
					})}
				>
					<div className="flex-1 w-full">
						<div className="font-bold">{archive.broadcast_name}</div>
						<div className="text-sm">
							{archive.broadcast_date
								? DateTime.fromISO(archive.broadcast_date).toFormat(
										"LLL dd, yyyy",
									)
								: ""}
						</div>
					</div>
					<RiArrowRightSLine className="size-8" />
				</Link>
			))}
		</div>
	);
};

export default function Archive({ data }: { data: LiveEventDto }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Card className="relative hover:cursor-pointer hover:bg-secondary h-full md:pb-(--card-spacing) pb-0">
					<img
						src={data.thumbnail ?? ""}
						alt=""
						className="md:relative absolute w-full aspect-video md:h-auto h-full object-cover"
					/>
					<CardContent className="relative flex-col md:items-start items-center md:h-auto h-full md:bg-none bg-gradient-to-t from-(--card) to-[color-mix(in_srgb,var(--card),transparent_40%)] md:py-0 py-(--card-spacing) md:drop-shadow-none drop-shadow-xs">
						<div className="font-bold line-clamp-2">{data.name}</div>
						<div className="text-sm">
							{data.date &&
								DateTime.fromISO(data.date).toFormat("LLL dd, yyyy")}
						</div>
					</CardContent>
				</Card>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader className="w-[calc(100%-20px)]">
					<DialogTitle>{data.name}</DialogTitle>
					<DialogDescription>
						Select section you want to watch
					</DialogDescription>
				</DialogHeader>
				<ArchiveSelector data={data} />
			</DialogContent>
		</Dialog>
	);
}
