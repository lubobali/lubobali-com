import type { Blueprint } from "../types";

// Example blueprint (Phase 3b B6): made by the live tool (Claude Opus 5.5 +
// our rules, 2026-10-20) from a TYPICAL story for a small law firm with 6 lawyers, written
// from public industry research (plans: phase-3b-research.md section 7).
// Never a client's project. Not signed: it can't be booked.
export const LAW: Blueprint = {
  "version": 1,
  "created": "2026-10-20T17:52:28+00:00",
  "pattern": {
    "id": "agents",
    "title": "AI agents that do the work",
    "promise": "An agent that reads your data, uses your tools and finishes the job, inside the app your team already uses."
  },
  "draft": {
    "why": {
      "problem": "Client details are typed in by hand, conflict checks are manual, and lawyers search hundreds of PDFs to answer the same client questions, between cases.",
      "goal": "Free lawyers and the assistant from retyping and searching, so clients get fast, correct answers."
    },
    "old_flow": [
      {
        "label": "Client sends details",
        "tool": "Email and phone",
        "minutes": null,
        "per": null,
        "pain": false
      },
      {
        "label": "Assistant types details in",
        "tool": "Case software",
        "minutes": null,
        "per": null,
        "pain": true
      },
      {
        "label": "Conflict check by hand",
        "tool": "Case software",
        "minutes": null,
        "per": null,
        "pain": true
      },
      {
        "label": "Client asks about contract",
        "tool": "Email",
        "minutes": null,
        "per": null,
        "pain": false
      },
      {
        "label": "Lawyer searches the PDFs",
        "tool": "PDFs",
        "minutes": null,
        "per": null,
        "pain": true
      },
      {
        "label": "Lawyer writes the reply",
        "tool": "Email",
        "minutes": null,
        "per": null,
        "pain": false
      }
    ],
    "players": [
      {
        "role": "Lawyers (6)",
        "does": "Answer client questions between cases",
        "power": "decides",
        "money_share": null
      },
      {
        "role": "Assistant",
        "does": "Types client details and runs conflict checks",
        "power": "does",
        "money_share": null
      },
      {
        "role": "Clients",
        "does": "Send details and ask about contracts and deadlines",
        "power": "informed",
        "money_share": null
      }
    ],
    "users": {
      "who": "The assistant and the 6 lawyers",
      "why": "To stop retyping client details and searching PDFs for answers."
    },
    "new_flow": [
      {
        "label": "Client details read from email"
      },
      {
        "label": "Case file filled in for you"
      },
      {
        "label": "Conflict check runs, lawyer approves"
      },
      {
        "label": "Answer drafted from client's PDFs"
      },
      {
        "label": "Lawyer checks source, then sends"
      }
    ],
    "app_name": "One client desk for the firm",
    "pattern": "agents",
    "data_issues": [
      "multiple_sources",
      "manual_copying",
      "unstructured_docs",
      "sensitive_data"
    ],
    "risks": [
      {
        "title": "Client files are confidential and privileged",
        "severity": "fix_first"
      },
      {
        "title": "Names spelled differently can hide a conflict",
        "severity": "watch"
      },
      {
        "title": "A wrong deadline in an answer could harm a client",
        "severity": "watch"
      }
    ],
    "questions_for_call": [
      "Which client questions come up most often, and which ones must always stay with a lawyer?",
      "How are your PDFs organised today: by client, by case, or all in one place?",
      "What exactly do you check in a conflict check, and where do those names come from?"
    ]
  },
  "readiness": {
    "score": 10,
    "reasons": [
      "Key facts sit in documents and PDFs",
      "4 different apps hold the data",
      "Important facts are in free text"
    ]
  },
  "timeline": {
    "label": "5–6 weeks",
    "weeks_min": 5,
    "weeks_max": 6,
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
        "label": "Connect the remaining apps",
        "weeks": 1
      },
      {
        "label": "Handover",
        "weeks": 1
      }
    ]
  },
  "time_saved": null,
  "locked": [
    "Which tools and AI models",
    "How it is built (architecture)",
    "How I solve each risk",
    "Cost estimate"
  ]
};
