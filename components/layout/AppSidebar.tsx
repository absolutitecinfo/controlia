"use client";

import { Home, MessageSquare, Settings, BarChart3, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Agentes", url: "/dashboard/colaborador", icon: MessageSquare },
  { title: "Configurações", url: "/dashboard/admin", icon: Settings },
  { title: "Analytics", url: "/dashboard/master", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = state === "collapsed";
  const isChatPage = pathname === "/dashboard/colaborador";
  
  // Estado para gerenciar chats (simulado)
  const [chats, setChats] = useState([
    { id: 1, title: "Conversa sobre IA", lastMessage: "Como funciona o machine learning?", timestamp: "10:30" },
    { id: 2, title: "Dúvidas sobre código", lastMessage: "Preciso de ajuda com React", timestamp: "09:15" },
    { id: 3, title: "Análise de dados", lastMessage: "Como criar um dashboard?", timestamp: "Ontem" },
    { id: 4, title: "Estratégia de marketing", lastMessage: "Campanhas para Q1 2024", timestamp: "Ontem" },
  ]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "Nova Conversa",
      lastMessage: "Conversa iniciada",
      timestamp: "Agora"
    };
    setChats([newChat, ...chats]);
  };

  const deleteChat = (chatId: number) => {
    setChats(chats.filter(chat => chat.id !== chatId));
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-hero-gradient">
              ControlIA.io
            </h2>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 rounded-lg bg-hero-gradient" />
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "hover:bg-sidebar-accent/50"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat History - só aparece na tela de Agentes */}
        {isChatPage && (
          <SidebarGroup className="flex-1">
            <div className="flex items-center justify-between px-2 py-1">
              <SidebarGroupLabel>Conversas</SidebarGroupLabel>
              {!isCollapsed && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={createNewChat}
                  className="h-6 w-6 p-0 hover:bg-sidebar-accent/50"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
            <SidebarGroupContent>
              <ScrollArea className="h-[calc(100vh-16rem)] sidebar-scrollbar">
                <div className="space-y-1 px-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className="group relative flex items-center gap-2 rounded-md p-2 text-sm hover:bg-sidebar-accent/50 transition-smooth"
                    >
                      <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{chat.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {chat.lastMessage}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {chat.timestamp}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteChat(chat.id)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
