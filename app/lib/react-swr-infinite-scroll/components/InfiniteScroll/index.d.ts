import React from 'react';
import type { SWRInfiniteResponse } from 'swr';
declare type Props<T> = {
    swr: SWRInfiniteResponse<T>;
    children: React.ReactChild | ((item: T) => React.ReactNode);
    loadingIndicator?: React.ReactNode;
    endingIndicator?: React.ReactNode;
    isReachingEnd: boolean | ((swr: SWRInfiniteResponse<T>) => boolean);
    offset?: number;
};
declare const InfiniteScroll: <T>(props: Props<T>) => React.ReactElement<Props<T>, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
export default InfiniteScroll;
