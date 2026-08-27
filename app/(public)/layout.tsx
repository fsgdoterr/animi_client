export default function PublicLayout({ children }: LayoutProps<"/">) {
    return (
        <div className="h-full flex">
            <main className="flex-1">{children}</main>
        </div>
    );
}
