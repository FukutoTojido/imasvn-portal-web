"use client";

import "~/components/videojs/styles/base.css";
import "~/components/videojs/styles/audio/theme.css";
import "~/components/videojs/styles/video/captions.css";
import "~/components/videojs/styles/video/theme.css";
import type { FullscreenButton as FullscreenButtonPrimitive } from "@videojs/react";
import {
	FullscreenEnterIcon as FullscreenEnterIconPrimitive,
	FullscreenExitIcon as FullscreenExitIconPrimitive,
} from "@videojs/react/icons";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Button } from "~/components/videojs/ui/button";
import { cn } from "~/lib/resolve-class-name";

export type FullscreenButtonProps = Omit<
	FullscreenButtonPrimitive.Props,
	"children"
> & {
	onClick?: (isFullscreen: boolean) => void;
	state?: boolean;
	setState?: Dispatch<SetStateAction<boolean>>;
};

export function FullscreenButton({
	className,
	state,
	setState,
	onClick,
}: FullscreenButtonProps = {}) {
	const [isFullscreen, setIsFullscreen] = useState(false);

	const _state = state ?? isFullscreen;
	const _setState = setState ?? setIsFullscreen;

	return (
		<Button
			className={cn("group/fullscreen", className)}
			onClick={() => {
				const value = !_state;
				_setState(value);
				onClick?.(value);
			}}
		>
			{!_state && (
				<FullscreenEnterIconPrimitive
					className={cn(
						"col-start-1 row-start-1 size-media-icon drop-shadow-media-icon [text-shadow:inherit]",
						"transition-[opacity,scale] duration-media-base ease-out",
					)}
				/>
			)}
			{_state && (
				<FullscreenExitIconPrimitive
					className={cn(
						"col-start-1 row-start-1 size-media-icon drop-shadow-media-icon [text-shadow:inherit]",
						"transition-[opacity,scale] duration-media-base ease-out",
					)}
				/>
			)}
		</Button>
	);
}
