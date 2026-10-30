"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import {
  AddApplicationModal,
  ApplicationsTable,
  FilterPills,
  ImportModal,
  Pagination,
  TableToolbar,
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
} from "@/lib/applications/actions";
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
  const [prevApplications, setPrevApplications] = useState(applications);
  const [localApplications, setLocalApplications] = useState<Application[]>(applications);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);

  // Sync state during render when server applications prop changes (React recommended pattern)
  if (applications !== prevApplications) {
    setPrevApplications(applications);
    setLocalApplications(applications);
  }

  const [activeFilter, setActiveFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [sortBy, setSortBy] = useState("Terbaru");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal state
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

  // Filter and sort items client-side from localApplications
  const filteredAndSortedApplications = useMemo(() => {
    let result = [...localApplications];

    // 1. Quick pill filter using the group helpers
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

  // Paginated items
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

      const res = await updateApplication(editingApplication.id, data);
      if (res.success) {
        closeModal();
        setToastMessage("Lamaran berhasil diperbarui!");
        setTimeout(() => setToastMessage(null), 3000);
        router.refresh();
      } else {
        alert(res.error || "Gagal memperbarui lamaran.");
        router.refresh();
      }
    } else {
      const res = await createApplication(data);
      if (res.success) {
        closeModal();
        setToastMessage("Lamaran berhasil disimpan!");
        setTimeout(() => setToastMessage(null), 3000);
        router.refresh();
      } else {
        alert(res.error || "Gagal menyimpan lamaran.");
      }
    }
  };

  const handleDelete = async (item: ApplicationItem) => {
    if (!item.id) return;
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus lamaran "${item.position} di ${item.company}"?\n\nTindakan ini permanen dan tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    const previousApps = localApplications;
    // Optimistic removal
    setLocalApplications((prev) => prev.filter((app) => app.id !== item.id));
    setToastMessage("Menghapus lamaran...");

    const res = await deleteApplication(item.id);
    if (res.success) {
      setToastMessage("Lamaran berhasil dihapus!");
      setTimeout(() => setToastMessage(null), 3000);
      router.refresh();
    } else {
      setLocalApplications(previousApps);
      alert(res.error || "Gagal menghapus lamaran.");
      setToastMessage(null);
    }
  };

  return (
    <AppShell title="Daftar Lamaran" userName={userName}>
      <div className={styles.page}>
        {/* 1. Page Header Row */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Daftar Lamaran</h1>
              <span className={styles.activePill}>Aktif</span>
            </div>
            <p className={styles.subtitle}>
              Kelola dan pantau seluruh progres riwayat lamaran pekerjaanmu secara real-time
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

        {/* 2. Filter Pills */}
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

        {/* 3. Table Toolbar */}
        <section aria-label="Tabel controls">
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
            onExport={() => {
              // Placeholder for export logic per PRD out of scope
            }}
          />
        </section>

        {/* 4. Applications Table & Pagination Container */}
        <section className={styles.tableCard} aria-label="Daftar lamaran kerja">
          <ApplicationsTable
            applications={tableRows}
            onEdit={(item) => {
              const target = localApplications.find((a) => a.id === item.id);
              if (target) {
                setEditingApplication(target);
                setIsModalOpen(true);
              }
            }}
            onDelete={handleDelete}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </section>

        {/* Feature banner "Sinkronisasi Otomatis Lewat Screenshot Email" intentionally excluded per docs/AGENTS.md boundaries. */}

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
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={(msg) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(null), 4000);
          }}
        />

        {/* Success Toast */}
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
