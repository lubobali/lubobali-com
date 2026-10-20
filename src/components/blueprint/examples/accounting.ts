import type { Blueprint } from "../types";

// Example blueprint (Phase 3b B6): made by the live tool (Claude Opus 5.5 +
// our rules, 2026-10-20) from a TYPICAL story for an accounting firm with 40 clients, written
// from public industry research (plans: phase-3b-research.md section 7).
// Never a client's project. Not signed: it can't be booked.
export const ACCOUNTING: Blueprint = {
  "version": 1,
  "created": "2026-10-20T17:52:00+00:00",
  "pattern": {
    "id": "agents",
    "title": "AI agents that do the work",
    "promise": "An agent that reads your data, uses your tools and finishes the job, inside the app your team already uses."
  },
  "draft": {
    "why": {
      "problem": "Every month the team chases 40 clients by email for bank statements and receipts, often 3 or 4 reminders each, then types it all into QuickBooks by hand.",
      "goal": "Get client documents in on time and into the books without retyping, so month-end close is much shorter."
    },
    "old_flow": [
      {
        "label": "Email clients for documents",
        "tool": "Email",
        "minutes": null,
        "per": null,
        "pain": false
      },
      {
        "label": "Send 3-4 reminders per client",
        "tool": "Email",
        "minutes": null,
        "per": null,
        "pain": true
      },
      {
        "label": "Collect statements and receipts",
        "tool": "Documents and PDFs",
        "minutes": null,
        "per": null,
        "pain": false
      },
      {
        "label": "Type everything in by hand",
        "tool": "QuickBooks",
        "minutes": null,
        "per": null,
        "pain": true
      },
      {
        "label": "Month-end close",
        "tool": "QuickBooks",
        "minutes": 2880,
        "per": "month",
        "pain": true
      }
    ],
    "players": [
      {
        "role": "Firm owner",
        "does": "Runs the firm and decides on new ways of working",
        "power": "decides",
        "money_share": null
      },
      {
        "role": "Bookkeepers (2)",
        "does": "Chase clients and type documents into QuickBooks",
        "power": "uses",
        "money_share": null
      },
      {
        "role": "Rest of the team",
        "does": "Work on client books and the month-end close",
        "power": "does",
        "money_share": null
      },
      {
        "role": "Small-business clients",
        "does": "Send bank statements and receipts each month",
        "power": "informed",
        "money_share": null
      }
    ],
    "users": {
      "who": "The two bookkeepers, every day during the month-end rush",
      "why": "Chasing and typing sits on top of their normal work and eats their time."
    },
    "new_flow": [
      {
        "label": "Clients get automatic reminders"
      },
      {
        "label": "Clients upload documents in one place"
      },
      {
        "label": "Agent reads statements and receipts"
      },
      {
        "label": "Entries prepared for QuickBooks"
      },
      {
        "label": "Bookkeepers check and approve"
      }
    ],
    "app_name": "One client documents desk",
    "pattern": "agents",
    "data_issues": [
      "unstructured_docs",
      "manual_copying",
      "sensitive_data",
      "unknown_quality"
    ],
    "risks": [
      {
        "title": "Bank statements arrive in many formats and bank layouts",
        "severity": "fix_first"
      },
      {
        "title": "Client financial data is sensitive and must stay protected",
        "severity": "fix_first"
      },
      {
        "title": "Photos of receipts may be blurry or incomplete",
        "severity": "watch"
      }
    ],
    "questions_for_call": [
      "Of the 6 days of month-end close, how much is chasing and typing, and how much is review and checks?",
      "Do clients send documents as PDFs, photos or paper, and does each client have a different bank?",
      "Who in the firm signs off on entries today before they are final in QuickBooks?"
    ]
  },
  "readiness": {
    "score": 13,
    "reasons": [
      "Key facts sit in documents and PDFs",
      "3 different apps hold the data",
      "Important facts are in free text"
    ]
  },
  "timeline": {
    "label": "4–5 weeks",
    "weeks_min": 4,
    "weeks_max": 5,
    "rounds": [
      {
        "label": "Clean up and connect your data",
        "weeks": 1
      },
      {
        "label": "Connect the agent to your data",
        "weeks": 1
      },
      {
        "label": "Teach it your real tasks",
        "weeks": 1
      },
      {
        "label": "Handover",
        "weeks": 1
      }
    ]
  },
  "time_saved": {
    "before_minutes": 665,
    "after_minutes": 100,
    "after_is_estimate": true
  },
  "locked": [
    "Which tools and AI models",
    "How it is built (architecture)",
    "How I solve each risk",
    "Cost estimate"
  ]
};
