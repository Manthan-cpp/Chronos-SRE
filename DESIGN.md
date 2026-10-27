# DESIGN.md — Chronos-SRE Visual & UX Spec (Light, Minimal, Tabbed)

Designed following the **Impeccable Design System** principles (Restraint, Distillation, Hierarchy, and Scannability). Built for developers, SREs, and engineering leaders who need clarity, speed, and zero cognitive overload.

---

## 1. Core Design Principles

1. **Restraint over decoration.** Zero glowing neon borders, zero gradient text, zero floating pills. A clean, disciplined enterprise aesthetic (similar to Linear, GitHub, and Stripe).
2. **Progressive Disclosure through Tabs.** Instead of overwhelming the user with logs, reasoning, terminals, and diffs on a single screen, the interface is organized into 4 clear, focused views:
   - **Overview:** Incident summary, priority, service details, and primary actions.
   - **Telemetry & Logs:** Searchable application logs and OpenTelemetry root trace data.
   - **Root Cause Analysis:** Autonomous multi-agent pipeline progress and streaming Nemotron-70B reasoning.
   - **Patch & Sandbox:** Ephemeral sandbox pytest status (Fail ➔ Pass) and Monaco code diff viewer with GitHub PR dispatch.
3. **One primary action at a time.** Clear visual hierarchy with a single primary button ("Run Investigation"), avoiding competing CTAs.
4. **Deterministic Proof.** Code patches are paired directly with pytest exit codes (`EXIT 1` ➔ `EXIT 0`).

---

## 2. Layout & Information Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  Chronos SRE    Incident: [ASYNC-DEADLOCK-402 ▾]       [Run Investigation]│  ← Clean, minimal header
├────────────────────────────────────────────────────────────────────────┤
│  [Overview]    [Telemetry & Logs]    [Root Cause Analysis]    [Patch & Sandbox]│  ← Clean underline tabs
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Active Tab Content (Single focused view, generous whitespace)        │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Color Palette & Tokens

Strict, unified color palette:

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Page Canvas** | `#f8fafc` (slate-50) | Neutral subtle page background |
| **Surface Card** | `#ffffff` (white) | Elevated card containers with 1px border |
| **Border Subtle** | `#e2e8f0` (slate-200) | Structural dividers and card outlines |
| **Text Primary** | `#0f172a` (slate-900) | High-contrast readable typography |
| **Text Secondary**| `#475569` (slate-600) | Metadata, timestamps, helper descriptions |
| **Primary Accent**| `#2563eb` (blue-600) | Single primary CTA, active tab indicator |
| **Success Status**| `#16a34a` (green-600)| Regression tests passed, verified badge |
| **Critical Status**| `#dc2626` (red-600) | Active crash, failing assertions |

---

## 4. Typography

- **System Font Stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` for clean readability.
- **Code & Logs:** `JetBrains Mono, Fira Code, monospace` used strictly for logs, trace IDs, and code diffs.
- **Scale:**
  - Page Heading: `20px` (semibold)
  - Card Heading: `14px` (semibold)
  - Body Text: `13px - 14px`
  - Logs & Code: `12px`

---

## 5. What This Design Explicitly Avoids

- **No glowing neon / cyberpunk effects.**
- **No gradient text or arbitrary colored glows.**
- **No 3-column information overload on a single screen.**
- **No multiple competing primary buttons.**
- **No fake progress spinners; every phase indicates deterministic status.**
