"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/Mascot";
import { DEFAULT_FINISH_MESSAGE, DEFAULTS, finishText, journalTitle, saveSettings, useSettings, type ReadMode, type Settings } from "@/lib/settings";

export default function SettingsPage() {
  const saved = useSettings();
  // Changes stay in a draft until the "Sauver" button is pressed.
  const [draft, setDraft] = useState<Settings | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const settings = draft ?? saved;
  const update = (patch: Partial<Settings>) => {
    setDraft({ ...settings, ...patch });
    setJustSaved(false);
  };
  const save = () => {
    if (!draft) return;
    saveSettings(draft);
    setDraft(null);
    setJustSaved(true);
  };

  return (
    <main className="shell">
      <h1 className="sheet-title">Réglages</h1>

      <div className="panel">
        <div className="field">
          <label htmlFor="mode">Fiches de lecture</label>
          <select id="mode" value={settings.readMode} onChange={(e) => update({ readMode: e.target.value as ReadMode })}>
            <option value="normal">Normale : le mot reste affiché</option>
            <option value="flash">Flash : le mot disparaît peu à peu</option>
            <option value="spell">Épeler : les lettres disparaissent peu à peu</option>
          </select>
        </div>

        {settings.readMode !== "normal" && (
          <div className="field">
            <label htmlFor="seconds">Secondes avant que le mot disparaisse</label>
            <input
              id="seconds"
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              value={settings.seconds}
              onChange={(e) => update({ seconds: Math.min(60, Math.max(1, Math.round(Number(e.target.value)) || 1)) })}
            />
          </div>
        )}

        {settings.readMode !== "spell" && (
          <div className="field">
            <label htmlFor="per-card">Nombre de mots par fiche</label>
            <select id="per-card" value={settings.wordsPerCard} onChange={(e) => update({ wordsPerCard: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <p className="hint">Les phrases restent seules.</p>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="field">
          <label htmlFor="calc-mode">Fiches de calcul</label>
          <select id="calc-mode" value={settings.calcMode} onChange={(e) => update({ calcMode: e.target.value as Settings["calcMode"] })}>
            <option value="normal">Normale : le calcul reste affiché</option>
            <option value="flash">Flash : le calcul disparaît peu à peu</option>
          </select>
        </div>

        {settings.calcMode === "flash" && (
          <div className="field">
            <label htmlFor="calc-seconds">Secondes avant que le calcul disparaisse</label>
            <input
              id="calc-seconds"
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              value={settings.calcSeconds}
              onChange={(e) => update({ calcSeconds: Math.min(60, Math.max(1, Math.round(Number(e.target.value)) || 1)) })}
            />
          </div>
        )}
      </div>

      <div className="panel">
        <div className="field">
          <label htmlFor="name">Prénom</label>
          <input
            id="name"
            type="text"
            autoComplete="given-name"
            maxLength={30}
            value={settings.name}
            onChange={(e) => update({ name: e.target.value })}
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
            onChange={(e) => update({ finishMessage: e.target.value })}
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

      <div className="settings-actions" aria-live="polite">
        <button type="button" className="btn small" onClick={() => update({ ...DEFAULTS, name: settings.name })}>
          <Icon name="redo" />
          Réglages par défaut
        </button>
        <Link href="/" className="btn small">
          <Icon name="book" />
          Journal de classe
        </Link>
        <button type="button" className="btn good" onClick={save} disabled={!draft}>
          <Icon name="check" />
          {justSaved ? "Sauvé !" : "Sauver"}
        </button>
      </div>
    </main>
  );
}
