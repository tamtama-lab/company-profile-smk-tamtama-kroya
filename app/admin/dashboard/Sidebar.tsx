"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FiBarChart2,
  FiChevronRight,
  FiFileText,
  FiHome,
  FiMap,
  FiPhone,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import { MdExpandMore, MdSportsTennis } from "react-icons/md";
import { LuFilePenLine, LuListChecks, LuTrophy } from "react-icons/lu";
import { TbMessageUser } from "react-icons/tb";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaGraduationCap } from "react-icons/fa6";

const sidebarItems = [
  {
    group: "dashboard",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: FiHome,
      },
    ],
  },
  {
    group: "konten & informasi landing page",
    items: [
      {
        icon: FiBarChart2,
        label: "Statistik Pendaftaran",
        href: "/admin/informasi/statistik-pendaftaran",
      },
      {
        icon: FiMap,
        label: "Jalur Pendaftaran",
        href: "/admin/informasi/jalur-pendaftaran",
      },
      {
        icon: FiFileText,
        label: "Syarat & Periode Pendaftaran",
        href: "/admin/informasi/syarat-periode-pendaftaran",
      },
      {
        icon: FiPhone,
        label: "Kontak & Media Sosial",
        href: "/admin/informasi/kontak-media",
      },
    ],
  },
  {
    group: "manajemen kesiswaan",
    items: [
      {
        icon: FaGraduationCap,
        label: "Data Alumni",
        href: "/admin/siswa/data-alumni",
      },
      {
        icon: LuTrophy,
        label: "Prestasi Siswa",
        href: "/admin/siswa/prestasi-siswa",
      },
      {
        icon: MdSportsTennis,
        label: "Ekstrakurikuler",
        href: "/admin/siswa/ekstrakurikuler",
      },
    ],
  },
  {
    group: "manajemen ppdb",
    items: [
      {
        icon: FiUsers,
        label: "Data Calon Murid",
        href: "/admin/ppdb/data-calon-murid",
      },
      {
        icon: TbMessageUser,
        label: "Panitia PPDB",
        href: "/admin/ppdb/panitia-ppdb",
      },
      {
        icon: LuFilePenLine,
        label: "Bukti Pendaftaran",
        href: "/admin/ppdb/bukti-pendaftaran",
      },
    ],
  },
  {
    group: "manajemen guru",
    items: [
      {
        icon: FaChalkboardTeacher,
        label: "Akun Guru",
        href: "/admin/guru/akun-guru",
      },
      {
        icon: LuListChecks,
        label: "Pendaftaran Oleh Guru",
        href: "/admin/guru/pendaftaran-oleh-guru",
      },
    ],
  },
  {
    group: "teknis",
    items: [
      {
        icon: FiSettings,
        label: "Pengaturan",
        href: "/admin/pengaturan",
      },
    ],
  },
];

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  // Compute initial expanded groups based on current pathname
  const getInitialExpandedGroups = () => {
    const activeGroup = sidebarItems.find((section) =>
      section.items.some((item) => item.href === pathname),
    )?.group;
    return new Set(activeGroup ? ["dashboard", activeGroup] : ["dashboard"]);
  };

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    getInitialExpandedGroups,
  );

  useEffect(() => {
    const activeGroup = sidebarItems.find((section) =>
      section.items.some((item) => item.href === pathname),
    )?.group;

    if (activeGroup && !expandedGroups.has(activeGroup) && !collapsed) {
      setExpandedGroups(new Set([...expandedGroups, activeGroup]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!collapsed) {
      const activeGroup = sidebarItems.find((section) =>
        section.items.some((item) => item.href === pathname),
      )?.group;

      if (activeGroup && !expandedGroups.has(activeGroup)) {
        setExpandedGroups(new Set([...expandedGroups, activeGroup]));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  };

  return (
    <aside
      className={`bg-white h-[calc(100vh-0rem)] my-10 py-10 transition-all duration-300 z-50 ${collapsed ? "w-16" : "w-62 overflow-y-scroll"} fixed left-0 top-0`}
    >
      <nav className="mt-8 flex flex-col gap-2 h-full">
        {sidebarItems.map((section) => (
          <div key={section.group} className="mb-4 px-3">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(section.group)}
                className="w-full flex items-center justify-between text-left text-sm font-semibold text-gray-600 uppercase hover:text-gray-800 transition-colors mb-2"
              >
                <span className="text-[10px]">{section.group}</span>
                {expandedGroups.has(section.group) ? (
                  <MdExpandMore className="text-xl shrink-0" />
                ) : (
                  <FiChevronRight className="text-xl shrink-0" />
                )}
              </button>
            )}
            {(collapsed || expandedGroups.has(section.group)) && (
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 py-2 px-4 rounded ${pathname === item.href ? "bg-primary hover:bg-primary/70 text-white" : ""} hover:bg-primary text-gray-800 font-medium transition-all ${collapsed ? "justify-center text-xl px-1" : "text-base"}`}
                  >
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{<item.icon className="text-xl" />}</span>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span>{<item.icon className="text-xl" />}</span>
                    )}
                    {!collapsed && (
                      <span className="text-xs">{item.label}</span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
