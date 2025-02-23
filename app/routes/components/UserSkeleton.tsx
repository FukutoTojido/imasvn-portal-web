const UserSkeleton = () => {
	return (
		<div className="flex-1 flex items-center gap-2.5">
			<div className="rounded-full w-10 h-10 skeleton" />
			<div className="flex flex-col gap-1">
				<div className="font-bold w-40 h-[1em] skeleton rounded-md" />
				<div className="text-sm text-primary-5 w-10 h-[0.875em] skeleton rounded-md" />
			</div>
		</div>
	);
};

export default UserSkeleton;
