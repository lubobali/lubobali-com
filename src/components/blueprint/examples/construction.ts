import type { Blueprint } from "../types";

// Example blueprint (Phase 3b B6): made by the live tool (Claude Opus 5.5 +
// our rules, 2026-10-20) from a TYPICAL story for a general contractor with 8 active jobs, written
// from public industry research (plans: phase-3b-research.md section 7).
// Never a client's project. Not signed: it can't be booked.
export const CONSTRUCTION: Blueprint = {
  "version": 1,
  "created": "2026-10-20T17:52:11+00:00",
  "pattern": {
    "id": "agents",
    "title": "AI agents that do the work",
    "promise": "An agent that reads your data, uses your tools and finishes the job, inside the app your team already uses."
  },
  "draft": {
    "why": {
      "problem": "Approved change orders often never reach billing, so you lose money on work your crews already did.",
      "goal": "Every approved change order and every hour on site gets billed, without the monthly scramble."
    },
    "old_flow": [
      {
        "label": "Foremen log hours and materials",
        "tool": "Paper",
        "minutes": null,
        "per": null,
        "pain": true
      },
      {
        "label": "Change orders sent for signatures",
        "tool": "Email",
        "minutes": null,
        "per": null,
        "pain": true
      },
      {
        "label": "PM and client approve change order",
        "tool": "Email",
        "minutes": null,
        "per": null,
        "pain": false
      },
      {
        "label": "Office builds monthly invoices",
        "tool": "QuickBooks",
        "minutes": 1800,
        "per": "month",
        "pain": true
      }
    ],
    "players": [
      {
        "role": "Foreman",
        "does": "Writes hours and materials on paper tickets",
        "power": "does",
        "money_share": null
      },
      {
        "role": "Project manager",
        "does": "Signs off change orders on each job",
        "power": "approves",
        "money_share": null
      },
      {
        "role": "Client",
        "does": "Signs off change orders and pays the invoices",
        "power": "approves",
        "money_share": null
      },
      {
        "role": "Office team",
        "does": "Builds invoices each month from tickets and emails",
        "power": "does",
        "money_share": null
      },
      {
        "role": "Owner",
        "does": "Wants every job billed in full",
        "power": "decides",
        "money_share": null
      }
    ],
    "users": {
      "who": "Foremen, project managers and the office team",
      "why": "Foremen log work once, PMs see approvals, and the office bills from one place."
    },
    "new_flow": [
      {
        "label": "Foremen log hours on site"
      },
      {
        "label": "Change orders signed in the app"
      },
      {
        "label": "Approved work flagged for billing"
      },
      {
        "label": "Invoice drafts ready for review"
      }
    ],
    "app_name": "One job billing app",
    "pattern": "agents",
    "data_issues": [
      "multiple_sources",
      "manual_copying",
      "unstructured_docs",
      "no_shared_ids"
    ],
    "risks": [
      {
        "title": "Paper tickets and emails don't link to one job number",
        "severity": "fix_first"
      },
      {
        "title": "Signed change orders are scattered across inboxes",
        "severity": "watch"
      },
      {
        "title": "Foremen may not switch from paper tickets easily",
        "severity": "watch"
      }
    ],
    "questions_for_call": [
      "How much do you think you lost last year on change orders that never got billed?",
      "How do you invoice today: fixed price, time and materials, or a mix per job?",
      "Do foremen have phones or tablets on site, and would they use them daily?"
    ]
  },
  "readiness": {
    "score": 30,
    "reasons": [
      "3 different apps hold the data",
      "Your data sits inside other apps",
      "The apps don't share the same IDs"
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
    "before_minutes": 416,
    "after_minutes": 60,
    "after_is_estimate": true
  },
  "locked": [
    "Which tools and AI models",
    "How it is built (architecture)",
    "How I solve each risk",
    "Cost estimate"
  ]
};
