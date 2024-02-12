export function Logger(namespace?: null): {
    info: ({ fn, message, data }: {
        fn?: null | undefined;
        message: any;
        data?: null | undefined;
    }) => void;
    error: ({ fn, message, data }: {
        fn?: null | undefined;
        message: any;
        data?: null | undefined;
    }) => void;
    warn: ({ fn, message, data }: {
        fn?: null | undefined;
        message: any;
        data?: null | undefined;
    }) => void;
};
