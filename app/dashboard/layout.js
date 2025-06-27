import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/features/dashboard"
import { UserButton } from "@clerk/nextjs"

export default function DashboardLayout({children}) {
  return (
    <SidebarProvider>
      <AppSidebar    />
      <SidebarInset className="w-full">
        <header className="flex w-full h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="w-full flex items-center justify-end">
            <UserButton />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}