import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { useGetLive } from "~/services/live.services";
import type { Route } from "./+types/[id]";
import UpdateArchive from "./components/UpdateArchive";
import UpdateEvent from "./components/UpdateEvent";

export default function Page({ params: { id } }: Route.ComponentProps) {
	const { data, isLoading, error } = useGetLive(id);

	return (
		<>
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link to="/admin/live">Live</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{data?.name}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<div className="flex md:flex-row flex-col gap-4 w-full items-start">
				<UpdateEvent data={data} />
				<UpdateArchive data={data} />
			</div>
		</>
	);
}
