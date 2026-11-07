'use client';

import '../styles/base.css';
import '../styles/audio/theme.css';
import '../styles/video/captions.css';
import '../styles/video/theme.css';
import { LiveButton as LiveButtonPrimitive } from '@videojs/react';

import { Button } from '~/components/videojs/ui/button';
import { cn, resolveClassName } from '~/lib/resolve-class-name';

export type LiveButtonProps = Omit<LiveButtonPrimitive.Props, 'children'>;

export function LiveButton({ className, ...props }: LiveButtonProps = {}) {
  return (
    <LiveButtonPrimitive
      render={<Button />}
      className={(state) =>
        cn(
          'inline-flex! w-auto items-center gap-1.5 px-3 py-2',
          'text-media-sm leading-none font-semibold tracking-wider uppercase',
          'before:inline-block before:size-2 before:shrink-0 before:rounded-media-pill',
          'before:bg-current/40 before:transition-[background-color] before:duration-media-base before:ease-out',
          'data-live-edge:before:bg-media-live',
          resolveClassName(className, state)
        )
      }
      {...props}
    />
  );
}
