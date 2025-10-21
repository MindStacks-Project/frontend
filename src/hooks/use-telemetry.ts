"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TelemetryMetadata, TelemetryOutcome } from "@/lib/telemetry";
import {
  appendTelemetryEvent,
  abandonTelemetryAttempt,
  finalizeTelemetryAttempt,
  startTelemetryAttempt,
} from "@/lib/telemetry";

type TelemetryOptions = TelemetryMetadata & {
  attemptContext?: Record<string, unknown>;
};

type FinalizePayload = {
  outcome: TelemetryOutcome;
  metrics?: Record<string, unknown>;
};

type FinalizeResult = {
  url: string;
  filename: string;
};

export function usePuzzleTelemetry(options: TelemetryOptions) {
  const attemptIdRef = useRef<string | null>(null);
  const finalizedRef = useRef<boolean>(false);
  const [attemptIdState, setAttemptIdState] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const downloadUrlRef = useRef<string | null>(null);
  const downloadFilenameRef = useRef<string | null>(null);

  useEffect(() => {
    downloadUrlRef.current = downloadUrl;
  }, [downloadUrl]);

  useEffect(() => {
    downloadFilenameRef.current = downloadFilename;
  }, [downloadFilename]);

  const metadata = useMemo<TelemetryMetadata>(
    () => ({
      puzzleId: options.puzzleId,
      puzzleType: options.puzzleType,
      difficulty: options.difficulty,
      source: options.source,
      puzzleMeta: options.puzzleMeta,
    }),
    [
      options.puzzleId,
      options.puzzleType,
      options.difficulty,
      options.source,
      options.puzzleMeta,
    ]
  );

  const revokeDownloadUrl = useCallback(() => {
    const currentUrl = downloadUrlRef.current;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
      downloadUrlRef.current = null;
    }
    downloadFilenameRef.current = null;
    setDownloadUrl(null);
    setDownloadFilename(null);
  }, []);

  const initializeAttempt = useCallback(() => {
    revokeDownloadUrl();
    const attempt = startTelemetryAttempt(metadata);
    attemptIdRef.current = attempt.id;
    setAttemptIdState(attempt.id);
    finalizedRef.current = false;
    appendTelemetryEvent(attempt.id, "attempt_started", options.attemptContext);
  }, [metadata, options.attemptContext, revokeDownloadUrl]);

  useEffect(() => {
    initializeAttempt();
    return () => {
      if (attemptIdRef.current && !finalizedRef.current) {
        abandonTelemetryAttempt(
          attemptIdRef.current,
          "component_unmounted"
        );
      }
      setAttemptIdState(null);
      revokeDownloadUrl();
    };
  }, [initializeAttempt, revokeDownloadUrl]);

  const logEvent = useCallback(
    (type: string, data?: Record<string, unknown>) => {
      const attemptId = attemptIdRef.current;
      if (!attemptId || finalizedRef.current) return;
      appendTelemetryEvent(attemptId, type, data);
    },
    []
  );

  const finalizeAttempt = useCallback(
    ({ outcome, metrics }: FinalizePayload): FinalizeResult | null => {
      const attemptId = attemptIdRef.current;
      if (!attemptId || finalizedRef.current) return null;

      const result = finalizeTelemetryAttempt(attemptId, outcome, metrics);
      if (!result) return null;
      finalizedRef.current = true;

      const contents = JSON.stringify(result, null, 2);
      const blob = new Blob([contents], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const filename = `mindstacks-${result.metadata.puzzleType}-${result.metadata.puzzleId}-${new Date(result.startedAt).toISOString()}.json`;

      revokeDownloadUrl();
      downloadUrlRef.current = url;
      downloadFilenameRef.current = filename;
      setDownloadUrl(url);
      setDownloadFilename(filename);

      return { url, filename };
    },
    [revokeDownloadUrl]
  );

  const resetAttempt = useCallback(() => {
    const attemptId = attemptIdRef.current;
    if (attemptId && !finalizedRef.current) {
      abandonTelemetryAttempt(attemptId, "reset_attempt");
    }
    initializeAttempt();
  }, [initializeAttempt]);

  const downloadTelemetry = useCallback(() => {
    const url = downloadUrlRef.current;
    const filename = downloadFilenameRef.current;
    if (!url || !filename) return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.click();
  }, []);

  return {
    attemptId: attemptIdState,
    logEvent,
    finalizeAttempt,
    resetAttempt,
    downloadTelemetry,
    downloadUrl,
    downloadFilename,
  };
}
