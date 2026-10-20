import type { Blueprint } from "../types";

// Example blueprint (Phase 3b B6): made by the live tool (Claude Opus 5.5 +
// our rules, 2026-10-20) from a TYPICAL story for a family clinic with 4 doctors, written
// from public industry research (plans: phase-3b-research.md section 7).
// Never a client's project. Not signed: it can't be booked.
export const CLINIC: Blueprint = {
  "version": 1,
  "created": "2026-10-20T17:28:29+00:00",
  "pattern": {
    "id": "agents",
    "title": "AI agents that do the work",
    "promise": "An agent that reads your data, uses your tools and finishes the job, inside the app your team already uses."
  },
  "draft": {
    "why": {
      "problem": "Patients fill paper and PDF intake forms that the front desk retypes by hand. Wrong or missing insurance details mean about 1 in 10 claims gets denied.",
      "goal": "Get patient details into your practice software right the first time, so fewer claims get denied."
    },
    "old_flow": [
      {
        "label": "Patient fills intake form",
        "tool": "Paper or PDF",
        "minutes": null,
        "per": null,
        "pain": false
      },
      {
        "label": "Front desk retypes the form",
        "tool": "Practice software",
        "minutes": 120,
        "per": "day",
        "pain": true
      },
      {
        "label": "Claim sent to insurer",
        "tool": "Practice software",
        "minutes": null,
        "per": null,
        "pain": false
      },
      {
        "label": "Billing fixes denied claims",
        "tool": "Practice software",
        "minutes": 300,
        "per": "week",
        "pain": true
      }
    ],
    "players": [
      {
        "role": "Doctors (4)",
        "does": "Run the clinic and see patients",
        "power": "decides",
        "money_share": null
      },
      {
        "role": "Front desk",
        "does": "Retypes intake forms into the practice software",
        "power": "does",
        "money_share": null
      },
      {
        "role": "Billing person",
        "does": "Fixes and resubmits denied claims by hand",
        "power": "does",
        "money_share": null
      },
      {
        "role": "Patients",
        "does": "Fill in paper and PDF intake forms",
        "power": "uses",
        "money_share": null
      }
    ],
    "users": {
      "who": "Your front desk and your billing person",
      "why": "No more retyping forms, and insurance problems are caught before a claim goes out."
    },
    "new_flow": [
      {
        "label": "Forms are read automatically"
      },
      {
        "label": "Details fill the practice software"
      },
      {
        "label": "Missing insurance info is flagged"
      },
      {
        "label": "Front desk checks only the flags"
      },
      {
        "label": "Clean claims go out the first time"
      }
    ],
    "app_name": "One patient intake assistant",
    "pattern": "agents",
    "data_issues": [
      "unstructured_docs",
      "manual_copying",
      "sensitive_data",
      "unknown_quality"
    ],
    "risks": [
      {
        "title": "Patient health and insurance data must stay private",
        "severity": "fix_first"
      },
      {
        "title": "Handwritten paper forms may be hard to read",
        "severity": "watch"
      },
      {
        "title": "Insurance details are often missing at intake",
        "severity": "watch"
      }
    ],
    "questions_for_call": [
      "What are the most common reasons your claims get denied today?",
      "Roughly how many intake forms come in on paper versus as PDFs each day?",
      "Who in the clinic would sign off on a new tool that touches patient records?"
    ]
  },
  "readiness": {
    "score": 19,
    "reasons": [
      "Key facts sit in documents and PDFs",
      "Important facts are in free text",
      "Nobody knows how clean the data is"
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
    "before_minutes": 900,
    "after_minutes": 135,
    "after_is_estimate": true
  },
  "locked": [
    "Which tools and AI models",
    "How it is built (architecture)",
    "How I solve each risk",
    "Cost estimate"
  ]
};
