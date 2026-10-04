"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/Mascot";
import { DEFAULT_FINISH_MESSAGE, finishText, journalTitle, saveSettings, useSettings } from "@/lib/settings";

export default function SettingsPage() {
  const settings = useSettings();

  return (
    <main className="shell">
      <h1 className="sheet-title">Réglages</h1>

      <div className="panel">
        <div className="field">
          <label htmlFor="name">Prénom</label>
          <input
            id="name"
            type="text"
            autoComplete="given-name"
            maxLength={30}
            value={settings.name}
            onChange={(e) => saveSettings({ name: e.target.value })}
            placeholder="Emma"
          />
          <p className="hint">Il s’écrit sur la ligne « Prénom » de chaque feuille. Le journal s’appellera « {journalTitle(settings)} ».</p>
        </div>

        <div className="field">
          <label htmlFor="finish">Message quand une fiche est finie</label>
          <textarea
            id="finish"
            rows={2}
            maxLength={120}
            value={settings.finishMessage}
            onChange={(e) => saveSettings({ finishMessage: e.target.value })}
            placeholder={DEFAULT_FINISH_MESSAGE}
            style={{ minHeight: 0 }}
          />
          <p className="hint">Écrivez {"{nom}"} là où le prénom doit apparaître.</p>
        </div>
      </div>

      <div className="panel preview" aria-live="polite">
        <strong>Aperçu</strong>
        <div className="preview-card">
          <Mascot size={110} />
          <p className="done-banner">
            <Icon name="check" />
            {finishText(settings)}
          </p>
        </div>
      </div>

      <p style={{ display: "flex", justifyContent: "center", margin: "8px 0 0" }}>
        <Link href="/" className="btn primary">
          <Icon name="book" />
          Retour au journal de classe
        </Link>
      </p>
      <p style={{ display: "flex", justifyContent: "center", margin: "16px 0 0" }}>
        <button type="button" className="btn small" onClick={() => saveSettings({ finishMessage: DEFAULT_FINISH_MESSAGE })}>
          <Icon name="redo" />
          Remettre le message d’origine
        </button>
      </p>
    </main>
  );
}
