"use client";

import { useMemo } from "react";
import { Application } from "@/types/application";
import { Zap, Compass } from "lucide-react";
import styles from "./CareerMomentumSignature.module.css";

interface CareerMomentumSignatureProps {
  applications: Application[];
  userName?: string;
}

export function CareerMomentumSignature({
  applications,
}: CareerMomentumSignatureProps) {
  const momentum = useMemo(() => {
    const total = applications.length;

    let submittedCount = 0;
    let testTaskCount = 0;
    let interviewCount = 0;
    let offerCount = 0;

    for (const app of applications) {
      const s = (app.status || "").toLowerCase();
      if (s === "offering" || s.includes("offer")) {
        offerCount++;
      } else if (
        s.includes("interview") ||
        s === "lgd" ||
        s === "fgd"
      ) {
        interviewCount++;
      } else if (
        s.includes("test") ||
        s.includes("task") ||
        s.includes("assessment")
      ) {
        testTaskCount++;
      } else {
        submittedCount++;
      }
    }

    const activePipeline = submittedCount + testTaskCount + interviewCount;

    // Determine momentum status statement
    let statusPill = "Stabil";
    let statusPillColor = "#107c74";
    let insightStatement =
      "Pipeline karier Anda siap dipercepat. Kirim lamaran baru untuk membangun ritme respons.";

    if (offerCount > 0) {
      statusPill = "Penawaran Aktif 🎉";
      statusPillColor = "#10b981";
      insightStatement = `Luar biasa! Anda memiliki ${offerCount} penawaran kerja (offer). Evaluasi kompensasi dan benefit sebelum mengambil keputusan.`;
    } else if (interviewCount > 0) {
      statusPill = "Tahap Wawancara 🚀";
      statusPillColor = "#8b5cf6";
      insightStatement = `${interviewCount} lamaran berhasil melaju ke tahap wawancara. Fokus pada persiapan studi kasus dan culture fit.`;
    } else if (testTaskCount > 0) {
      statusPill = "Tahap Penilaian ⚡";
      statusPillColor = "#d97706";
      insightStatement = `${testTaskCount} lamaran dalam pengerjaan technical test & task. Jaga ketepatan waktu pengumpulan deadline.`;
    } else if (submittedCount > 0) {
      statusPill = "Menunggu Review ⏳";
      statusPillColor = "#107c74";
      insightStatement = `${submittedCount} lamaran telah terkirim. Rata-rata HR memberikan respons pertama dalam 3-7 hari kerja.`;
    }

    // Stages computation
    const stages = [
      {
        id: "submitted",
        step: "01",
        name: "Terkirim",
        count: submittedCount,
        color: "#107c74",
        percentage: total > 0 ? Math.round((submittedCount / total) * 100) : 0,
        active: submittedCount > 0,
      },
      {
        id: "assessment",
        step: "02",
        name: "Test & Task",
        count: testTaskCount,
        color: "#d97706",
        percentage: total > 0 ? Math.round((testTaskCount / total) * 100) : 0,
        active: testTaskCount > 0,
      },
      {
        id: "interview",
        step: "03",
        name: "Wawancara",
        count: interviewCount,
        color: "#8b5cf6",
        percentage: total > 0 ? Math.round((interviewCount / total) * 100) : 0,
        active: interviewCount > 0,
      },
      {
        id: "offer",
        step: "04",
        name: "Penawaran",
        count: offerCount,
        color: "#10b981",
        percentage: total > 0 ? Math.round((offerCount / total) * 100) : 0,
        active: offerCount > 0,
      },
    ];

    return {
      total,
      activePipeline,
      statusPill,
      statusPillColor,
      insightStatement,
      stages,
    };
  }, [applications]);

  return (
    <section className={styles.signatureCard} aria-label="Visual Signature Jobora Career Momentum">
      <div className={styles.ambientGraphic} aria-hidden="true" />

      <div className={styles.cardInner}>
        {/* Header Row */}
        <div className={styles.headerRow}>
          <div className="flex items-center gap-2.5">
            <span className={styles.brandPill}>
              <Zap size={12} className="text-[#107c74]" />
              <span>Jobora Career Momentum™</span>
            </span>
          </div>

          <div
            className={styles.momentumBadge}
            style={{ borderColor: `${momentum.statusPillColor}33` }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: momentum.statusPillColor }}
            />
            <span style={{ color: momentum.statusPillColor }}>
              {momentum.statusPill}
            </span>
          </div>
        </div>

        {/* Title area */}
        <div className={styles.titleArea}>
          <h2 className={styles.mainTitle}>
            Kecepatan & Aliran Pipeline Karier Anda
          </h2>
          <p className={styles.subTitle}>
            Pelacakan ritme konversi dari lamaran terkirim hingga penawaran kerja akhir.
          </p>
        </div>

        {/* Velocity Track: 4 connected progression stages */}
        <div className={styles.velocityTrack}>
          {momentum.stages.map((stage) => (
            <div
              key={stage.id}
              className={`${styles.stageNode} ${
                stage.active ? styles.stageNodeActive : ""
              }`}
            >
              <div className={styles.nodeHeader}>
                <span className={styles.stepNumber}>Tahap {stage.step}</span>
                <span
                  className={styles.stageDot}
                  style={{ backgroundColor: stage.color }}
                />
              </div>

              <h3 className={styles.stageName} title={stage.name}>
                {stage.name}
              </h3>

              <div className={styles.stageMetrics}>
                <span className={styles.stageCount}>{stage.count}</span>
                <span className={styles.stageUnit}>
                  lamaran ({stage.percentage}%)
                </span>
              </div>

              <div className={styles.stageBarTrack}>
                <div
                  className={styles.stageBarFill}
                  style={{
                    width: `${Math.max(4, stage.percentage)}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Insight Strip */}
        <div className={styles.footerStrip}>
          <p className={styles.insightText}>
            <Compass size={16} className={styles.insightIcon} />
            <span>{momentum.insightStatement}</span>
          </p>

          <div className={styles.momentumStats}>
            <div className={styles.momentumStatItem}>
              <span className={styles.momentumStatLabel}>Total Dilacak:</span>
              <span className={styles.momentumStatValue}>
                {momentum.total} Lamaran
              </span>
            </div>
            <div className={styles.momentumStatItem}>
              <span className={styles.momentumStatLabel}>Sedang Aktif:</span>
              <span className={styles.momentumStatValue}>
                {momentum.activePipeline} Proses
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
