export function exportBackupData(): void {
  if (typeof window === "undefined") return;

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dateStr = new Date().toISOString().split("T")[0];

    // Gather localStorage finance keys if any
    const financeData: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("jobora_finance_")) {
        try {
          financeData[key] = JSON.parse(localStorage.getItem(key) || "");
        } catch {
          financeData[key] = localStorage.getItem(key);
        }
      }
    }

    const backupPayload = {
      app: "Jobora Job & Finance Tracker",
      version: "2.0",
      exportedAt: new Date().toISOString(),
      financeData,
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `jobora_backup_${dateStr}_${timestamp.slice(11, 19)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (error) {
    console.error("Backup data export failed:", error);
    alert("Gagal melakukan backup data.");
  }
}
