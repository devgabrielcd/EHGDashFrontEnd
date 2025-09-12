"use client";

import React from "react";
import ProfileCard from "../../dash/employee/ui/cards/ProfileCard";
import KPIGrid from "../../dash/employee/ui/cards/KPIGrid";
import QuickActions from "../../dash/employee/ui/cards/QuickActions";
import TasksCard from "../../dash/employee/ui/cards/TasksCard";
import AnnouncementsCard from "../../dash/employee/ui/cards/AnnouncementsCard";
import BenefitsCard from "../../dash/employee/ui/cards/BenefitsCard";
import TrainingCard from "../../dash/employee/ui/cards/TrainingCard";
import UpcomingEventsCard from "../../dash/employee/ui/cards/UpcomingEventsCard";
import TimesheetCard from "../../dash/employee/ui/cards/TimesheetCard";

/**
 * Props:
 * - user: vem de Dashboard (user.details)
 */
export default function DashEmployee({ user }) {
  // Derivações básicas do objeto user.details (ajuste conforme seu schema real)
  const employee = {
    id: user?.id,
    name: user?.name || user?.first_name || user?.full_name || "Employee",
    email: user?.email,
    avatarUrl: user?.avatar || user?.image,
    roleTitle: user?.job_title || "Employee",
    department: user?.department || "Operations",
    manager: user?.manager_name || "—",
    location: user?.location || "Remote",
  };

  // MOCKS (troque depois por dados reais do backend)
  const kpis = [
    { label: "Tasks done (month)", value: 18 },
    { label: "Open tasks", value: 7 },
    { label: "On-time delivery", value: "96%" },
    { label: "Hours logged (week)", value: 32 },
  ];

  const tasks = [
    { id: "t1", title: "Submit expense report", due: "2025-09-02", priority: "High", status: "Open" },
    { id: "t2", title: "Finalize client deck", due: "2025-09-05", priority: "Medium", status: "In Progress" },
    { id: "t3", title: "Update CRM notes", due: "2025-08-31", priority: "Low", status: "Open" },
  ];

  const announcements = [
    { id: "a1", title: "Remote policy update", date: "2025-08-28", summary: "New stipend for home office." },
    { id: "a2", title: "Quarterly all-hands", date: "2025-09-10", summary: "Join the company-wide meeting." },
  ];

  const benefits = [
    { id: "b1", label: "Paid Time Off", value: "14 days available" },
    { id: "b2", label: "Meal Allowance", value: "R$ 32/day" },
    { id: "b3", label: "Health Plan", value: "Premium" },
  ];

  const training = [
    { id: "c1", title: "Security Awareness", progress: 0.8 },
    { id: "c2", title: "Advanced Excel", progress: 0.25 },
  ];

  const events = [
    { id: "e1", title: "Sales sync", date: "2025-09-01 10:00", location: "Room A" },
    { id: "e2", title: "Design review", date: "2025-09-03 15:00", location: "Meet" },
  ];

  const quickActions = [
    { key: "vacation", label: "Request vacation", href: "/hr/vacation" },
    { key: "timesheet", label: "Open timesheet", href: "/timesheet" },
    { key: "payslips", label: "View payslips", href: "/hr/payslips" },
    { key: "directory", label: "Team directory", href: "/directory" },
  ];

  const timesheet = {
    week: "Aug 25 – Aug 31",
    hours: [
      { day: "Mon", h: 8 }, { day: "Tue", h: 7.5 }, { day: "Wed", h: 8 },
      { day: "Thu", h: 4 }, { day: "Fri", h: 4.5 }, { day: "Sat", h: 0 }, { day: "Sun", h: 0 },
    ],
  };

  // GRID responsivo (12 colunas)
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(12, 1fr)" }}>
      {/* Coluna esquerda: Perfil + KPIs */}
      <div style={{ gridColumn: "span 4" }}>
        <ProfileCard employee={employee} />
        <div style={{ height: 16 }} />
        <KPIGrid items={kpis} />
      </div>

      {/* Centro: Tarefas + Timesheet */}
      <div style={{ gridColumn: "span 5" }}>
        <TasksCard tasks={tasks} />
        <div style={{ height: 16 }} />
        <TimesheetCard data={timesheet} />
      </div>

      {/* Direita: Ações + Comunicados + Agenda */}
      <div style={{ gridColumn: "span 3" }}>
        <QuickActions items={quickActions} />
        <div style={{ height: 16 }} />
        <AnnouncementsCard items={announcements} />
        <div style={{ height: 16 }} />
        <UpcomingEventsCard items={events} />
      </div>

      {/* Linha de baixo: Benefícios + Treinamentos */}
      <div style={{ gridColumn: "span 6" }}>
        <BenefitsCard items={benefits} />
      </div>
      <div style={{ gridColumn: "span 6" }}>
        <TrainingCard items={training} />
      </div>
    </div>
  );
}
