import { Sidebar } from "@/components/Sidebar";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 bg-background">
                {children}
            </main>
        </div>
    );
}
