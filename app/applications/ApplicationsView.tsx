"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout";
import {
  AddApplicationModal,
  ApplicationsTable,
  FilterPills,
  ImportModal,
  Pagination,
  TableToolbar,
  KanbanBoard,
  ApplicationDetailModal,
  type ApplicationItem,
  type AddApplicationFormData,
} from "@/components/applications";
import { Application } from "@/types/application";
import {
  isInterviewGroup,
  isTestTaskGroup,
  formatDate,
  normalizeDateToISO,
} from "@/lib/applications/format";
import { isFollowUp } from "@/lib/applications/reminders";
import {
  createApplication,
  updateApplication,
  deleteApplication,
  updateApplicationStatus,
} from "@/lib/applications/actions";
import { recordStatusChange } from "@/lib/applications/recruitment-service";
import { createClient } from "@/lib/supabase/client";
import styles from "./applications.module.css";

const PAGE_SIZE = 10;

function formatISOToInputDate(isoDate: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("T")[0].split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
}

export interface ApplicationsViewProps {
  userName?: string;
  applications: Application[];
}

export function ApplicationsView({
  userName,
  applications,
}: ApplicationsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active view: "table" | "kanban"
  const initialView = (searchParams?.get("view") as "table" | "kanban") || "table";
  const [view, setView] = useState<"table" | "kanban">(
    ["table", "kanban"].includes(initialView) ? initialView : "table"
  );

  const [prevApplications, setPrevApplications] = useState(applications);
  const [localApplications, setLocalApplications] = useState<Application[]>(applications);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [detailApplication, setDetailApplication] = useState<Application | null>(null);

  // Sync state during render when server applications prop changes
  if (applications !== prevApplications) {
    setPrevApplications(applications);
    setLocalApplications(applications);
  }

  // Resolve user id
  const [userId, setUserId] = useState<string>(applications[0]?.user_id || "");

  useEffect(() => {
    if (!userId) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.id) {
          setUserId(data.user.id);
        }
      });
    }
  }, [userId]);

  // Filters and sorting - Used across both Table and Kanban views
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [sortBy, setSortBy] = useState("Terbaru");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"manual" | "ai">("manual");

  const openModal = (tab: "manual" | "ai") => {
    setEditingApplication(null);
    setModalTab(tab);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingApplication(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compute status pill counts using shared group helpers over localApplications
  const filterPillItems = useMemo(() => {
    let submitted = 0;
    let testTask = 0;
    let interview = 0;
    let offering = 0;
    let rejected = 0;

    for (const app of localApplications) {
      if (app.status === "Submitted") {
        submitted++;
      } else if (isTestTaskGroup(app.status)) {
        testTask++;
      } else if (isInterviewGroup(app.status)) {
        interview++;
      } else if (app.status === "Offering" || app.status === "Offering Received") {
        offering++;
      } else if (app.status === "Rejected") {
        rejected++;
      }
    }

    return [
      { label: "Semua", count: localApplications.length },
      { label: "Submitted", count: submitted },
      { label: "Test & Task", count: testTask },
      { label: "Interview", count: interview },
      { label: "Offering", count: offering },
      { label: "Rejected", count: rejected },
    ];
  }, [localApplications]);

  // Filter and sort items client-side from localApplications (shared by Table and Kanban)
  const filteredAndSortedApplications = useMemo(() => {
    let result = [...localApplications];

    // 1. Quick pill filter
    if (activeFilter === "Submitted") {
      result = result.filter((app) => app.status === "Submitted");
    } else if (activeFilter === "Test & Task") {
      result = result.filter((app) => isTestTaskGroup(app.status));
    } else if (activeFilter === "Interview") {
      result = result.filter((app) => isInterviewGroup(app.status));
    } else if (activeFilter === "Offering") {
      result = result.filter(
        (app) => app.status === "Offering" || app.status === "Offering Received"
      );
    } else if (activeFilter === "Rejected") {
      result = result.filter((app) => app.status === "Rejected");
    }

    // 2. Toolbar status filter dropdown
    if (statusFilter !== "Semua Status") {
      if (statusFilter === "Test & Task") {
        result = result.filter((app) => isTestTaskGroup(app.status));
      } else if (statusFilter === "Offering") {
        result = result.filter(
          (app) => app.status === "Offering" || app.status === "Offering Received"
        );
      } else {
        result = result.filter((app) => app.status === statusFilter);
      }
    }

    // 3. Search query: filter by company or position (case-insensitive)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (app) =>
          app.company.toLowerCase().includes(q) ||
          app.position.toLowerCase().includes(q)
      );
    }

    // 4. Sort: Terbaru (date desc), Terlama (date asc), Perusahaan (A-Z)
    if (sortBy === "Terbaru") {
      result.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (sortBy === "Terlama") {
      result.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (sortBy === "Perusahaan (A-Z)") {
      result.sort((a, b) => a.company.localeCompare(b.company));
    }

    return result;
  }, [localApplications, activeFilter, statusFilter, searchQuery, sortBy]);

  // Paginated items for Table View
  const totalItems = filteredAndSortedApplications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedApplications.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredAndSortedApplications, currentPage]);

  // Map to ApplicationsTable component shape
  const tableRows: ApplicationItem[] = useMemo(() => {
    return paginatedApplications.map((app) => ({
      id: app.id,
      company: app.company,
      companyMeta: `${app.type} • ${app.platform || "Tidak dicatat"}`,
      position: app.position,
      jobType: app.type,
      platform: app.platform || "Tidak dicatat",
      applyDate: formatDate(app.date),
      rawDate: app.date,
      status: app.status,
      needsFollowUp: isFollowUp(app),
    }));
  }, [paginatedApplications]);

  // Prepare initial form data when editing
  const initialFormData: AddApplicationFormData | null = useMemo(() => {
    if (!editingApplication) return null;
    const knownPlatforms = ["LinkedIn", "Kalibrr", "JobStreet", "Glints", "Career Portal"];
    const isKnown = knownPlatforms.includes(editingApplication.platform);
    return {
      company: editingApplication.company,
      position: editingApplication.position,
      jobType: editingApplication.type || "Full-time",
      initialStatus: editingApplication.status || "Submitted",
      applyDate: formatISOToInputDate(editingApplication.date),
      platform: isKnown ? editingApplication.platform : "Lainnya (Others)",
      customPlatform: isKnown ? "" : editingApplication.platform,
    };
  }, [editingApplication]);

  const handleFormSubmit = async (data: AddApplicationFormData) => {
    if (editingApplication) {
      // Optimistic update
      const updatedDateISO = normalizeDateToISO(data.applyDate || "");
      const resolvedPlatform =
        data.platform === "Lainnya (Others)" && data.customPlatform?.trim()
          ? data.customPlatform.trim()
          : data.platform?.trim() || "Tidak dicatat";

      setLocalApplications((prev) =>
        prev.map((app) =>
          app.id === editingApplication.id
            ? {
                ...app,
                company: data.company.trim(),
                position: data.position.trim(),
                type: data.jobType,
                status: data.initialStatus,
                platform: resolvedPlatform,
                date: updatedDateISO,
                updated_at: new Date().toISOString(),
              }
            : app
        )
      );

      closeModal();
      showToast("Memperbarui lamaran...");

      const res = await updateApplication(editingApplication.id, data);

      if (res.success) {
        showToast("Lamaran berhasil diperbarui!");
        router.refresh();
      } else {
        alert(res.error || "Gagal memperbarui lamaran.");
        router.refresh();
      }
    } else {
      const res = await createApplication(data);
      if (res.success) {
        closeModal();
        showToast("Lamaran berhasil disimpan!");
        router.refresh();
      } else {
        alert(res.error || "Gagal menyimpan lamaran.");
      }
    }
  };

  const handleDelete = async (target: { id?: string; company: string; position: string }) => {
    if (!target.id) return;
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus lamaran "${target.position} di ${target.company}"?\n\nTindakan ini permanen dan tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    const previousApps = localApplications;
    setLocalApplications((prev) => prev.filter((app) => app.id !== target.id));
    showToast("Menghapus lamaran...");

    const res = await deleteApplication(target.id);
    if (res.success) {
      showToast("Lamaran berhasil dihapus!");
      router.refresh();
    } else {
      setLocalApplications(previousApps);
      alert(res.error || "Gagal menghapus lamaran.");
      setToastMessage(null);
    }
  };

  // Kanban Status Change Handler (Drag-and-Drop & Accessible Move)
  const handleKanbanStatusChange = async (appId: string, newStatus: string): Promise<boolean> => {
    const targetApp = localApplications.find((a) => a.id === appId);
    if (!targetApp) return false;

    const previousStatus = targetApp.status;
    if (previousStatus === newStatus) return true;

    // Optimistic UI update
    setLocalApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? { ...a, status: newStatus, updated_at: new Date().toISOString() }
          : a
      )
    );

    // Call server action
    const res = await updateApplicationStatus(appId, newStatus);
    if (res.success) {
      // Record history
      if (userId) {
        recordStatusChange(userId, appId, previousStatus, newStatus);
      }
      showToast(`Status ${targetApp.company} diubah ke ${newStatus}`);
      router.refresh();
      return true;
    } else {
      // Revert optimistic update
      setLocalApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: previousStatus } : a))
      );
      alert(res.error || "Gagal mengubah status lamaran.");
      return false;
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredAndSortedApplications.length === 0) {
      alert("Tidak ada data lamaran untuk diexport.");
      return;
    }

    const headers = ["Perusahaan", "Posisi", "Status", "Tanggal Melamar", "Tipe", "Platform"];
    const rows = filteredAndSortedApplications.map((app) => [
      `"${app.company.replace(/"/g, '""')}"`,
      `"${app.position.replace(/"/g, '""')}"`,
      `"${app.status.replace(/"/g, '""')}"`,
      `"${app.date.split("T")[0]}"`,
      `"${(app.type || "").replace(/"/g, '""')}"`,
      `"${(app.platform || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jobora_lamaran_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell title="Job Journey" userName={userName}>
      <div className={styles.container}>
        {/* 1. Header with Page Title & CTAs */}
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Job Journey</h1>
            <p className={styles.subtitle}>
              Kelola dan pantau seluruh status lamaran kerja Anda secara terstruktur.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.secondaryCta}
              onClick={() => setIsImportModalOpen(true)}
            >
              <span
                className={`material-symbols-outlined ${styles.secondaryCtaIcon}`}
                aria-hidden="true"
              >
                upload_file
              </span>
              Import Data
            </button>

            <button
              type="button"
              className={styles.secondaryCta}
              onClick={() => openModal("ai")}
            >
              <span
                className={`material-symbols-outlined ${styles.secondaryCtaIcon}`}
                aria-hidden="true"
              >
                auto_awesome
              </span>
              Upload Screenshot (AI)
              <span className={styles.betaBadge}>Beta</span>
            </button>

            <button
              type="button"
              className={styles.primaryCta}
              onClick={() => openModal("manual")}
            >
              <span
                className={`material-symbols-outlined ${styles.primaryCtaIcon}`}
                aria-hidden="true"
              >
                add
              </span>
              Tambah Lamaran
            </button>
          </div>
        </header>

        {/* 2. View Switcher: Tabel vs Kanban */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-1">
          <div className={styles.viewSwitcher} role="tablist" aria-label="Pilihan tampilan lamaran">
            <button
              type="button"
              role="tab"
              aria-selected={view === "table"}
              className={`${styles.viewSwitchBtn} ${
                view === "table" ? styles.viewSwitchBtnActive : ""
              }`}
              onClick={() => setView("table")}
            >
              <span className={`material-symbols-outlined ${styles.viewSwitchIcon}`} aria-hidden="true">
                table_chart
              </span>
              <span>Tabel</span>
              <span className="text-[10px] opacity-75 font-bold">({localApplications.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={view === "kanban"}
              className={`${styles.viewSwitchBtn} ${
                view === "kanban" ? styles.viewSwitchBtnActive : ""
              }`}
              onClick={() => setView("kanban")}
            >
              <span className={`material-symbols-outlined ${styles.viewSwitchIcon}`} aria-hidden="true">
                view_kanban
              </span>
              <span>Kanban</span>
            </button>
          </div>
        </div>

        {/* 3. Filter Pills: Status Summary (Always visible in both Table & Kanban) */}
        <section aria-label="Status filters">
          <FilterPills
            items={filterPillItems}
            active={activeFilter}
            onChange={(filter) => {
              setActiveFilter(filter);
              setCurrentPage(1);
            }}
          />
        </section>

        {/* 4. Search and Table/Kanban Controls: Search Bar, Status Filter, Sort, Export */}
        <section aria-label="Search and controls">
          <TableToolbar
            search={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(s) => {
              setStatusFilter(s);
              setCurrentPage(1);
            }}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            onExport={handleExportCSV}
          />
        </section>

        {/* 5. View Content: Table View vs Kanban View */}
        {view === "table" && (
          <section className={styles.tableCard} aria-label="Daftar lamaran kerja">
            <ApplicationsTable
              applications={tableRows}
              onViewDetail={(item) => {
                const target = localApplications.find((a) => a.id === item.id);
                if (target) {
                  setDetailApplication(target);
                }
              }}
              onEdit={(item) => {
                const target = localApplications.find((a) => a.id === item.id);
                if (target) {
                  setEditingApplication(target);
                  setIsModalOpen(true);
                }
              }}
              onDelete={(item) => handleDelete(item)}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </section>
        )}

        {view === "kanban" && (
          <section aria-label="Kanban board lamaran kerja">
            <KanbanBoard
              applications={filteredAndSortedApplications}
              onStatusChange={handleKanbanStatusChange}
              onViewDetail={(app) => setDetailApplication(app)}
              onEdit={(app) => {
                setEditingApplication(app);
                setIsModalOpen(true);
              }}
              onDelete={(app) => handleDelete(app)}
            />
          </section>
        )}

        {/* Application Detail Modal (View Status History) */}
        {detailApplication && (
          <ApplicationDetailModal
            isOpen={Boolean(detailApplication)}
            application={detailApplication}
            userId={userId}
            onClose={() => setDetailApplication(null)}
            onEdit={(app) => {
              setDetailApplication(null);
              setEditingApplication(app);
              setIsModalOpen(true);
            }}
            onDelete={(app) => {
              setDetailApplication(null);
              handleDelete(app);
            }}
          />
        )}

        {/* Shared Add / Edit Application Modal */}
        {isModalOpen && (
          <AddApplicationModal
            isOpen={isModalOpen}
            mode={editingApplication ? "edit" : "create"}
            initialData={initialFormData}
            initialTab={modalTab}
            onClose={closeModal}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* Import Applications Modal */}
        {isImportModalOpen && (
          <ImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onSuccess={(msg) => {
              showToast(msg);
            }}
          />
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className={styles.toast} role="status">
            <span className="material-symbols-outlined" aria-hidden="true">
              check_circle
            </span>
            {toastMessage}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default ApplicationsView;
