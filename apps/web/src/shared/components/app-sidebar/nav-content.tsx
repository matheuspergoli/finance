import { Link } from "@tanstack/react-router"

import { ArrowLeftRight, LayoutDashboard, Settings, Tags } from "lucide-react"
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from "../sidebar"

export const NavContent = () => {
	return (
		<>
			<SidebarGroup>
				<SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild tooltip="Início">
							<Link to="/dashboard">
								<LayoutDashboard />
								<span>Início</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<SidebarMenuItem>
						<SidebarMenuButton asChild tooltip="Transações">
							<Link to="/dashboard/transactions">
								<ArrowLeftRight />
								<span>Transações</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>

			<SidebarGroup>
				<SidebarGroupLabel>Sistema</SidebarGroupLabel>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild tooltip="Configurações">
							<Link to="/dashboard/settings">
								<Settings />
								<span>Configurações</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>
		</>
	)
}
