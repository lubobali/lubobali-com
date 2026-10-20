import type { Blueprint } from "../types";

// Example blueprint (Phase 3b B6): made by the live tool (Claude Opus 5.5 +
// our rules, 2026-10-20) from a TYPICAL story for a payments ISO with 30 sales agents, written
// from public industry research (plans: phase-3b-research.md section 7).
// Never a client's project. Not signed: it can't be booked.
export const PAYMENTS: Blueprint = {
  "version": 1,
  "created": "2026-10-20T17:28:11+00:00",
  "pattern": {
    "id": "trusted_answers",
    "title": "Answers you can trust",
    "promise": "Numbers calculated from your real data by code, with the AI only explaining them, so it can't make up a figure."
  },
  "draft": {
    "why": {
      "problem": "Every month, agent splits are worked out by hand in Excel from 3 processor reports. It takes 2 full days and agents often dispute their numbers.",
      "goal": "Correct agent payouts every month, fast, with numbers agents can check and trust."
    },
    "old_flow": [
      {
        "label": "Download residual reports",
        "tool": "Processor portals",
        "minutes": null,
        "per": null,
        "pain": false
      },
      {
        "label": "Match merchants, calculate splits",
        "tool": "Excel",
        "minutes": 960,
        "per": "month",
        "pain": true
      },
      {
        "label": "Check splits against contracts",
        "tool": "Contract PDFs",
        "minutes": null,
        "per": null,
        "pain": true
      },
      {
        "label": "CEO approves the splits",
        "tool": "Excel",
        "minutes": null,
        "per": null,
        "pain": false
      },
      {
        "label": "Finance pays, agents dispute",
        "tool": "Excel",
        "minutes": null,
        "per": null,
        "pain": true
      }
    ],
    "players": [
      {
        "role": "CEO",
        "does": "Approves every agent split before payout",
        "power": "approves",
        "money_share": null
      },
      {
        "role": "Finance person",
        "does": "Downloads reports, matches merchants, pays agents",
        "power": "does",
        "money_share": null
      },
      {
        "role": "Sales agents (30)",
        "does": "Earn a 40 to 60 percent split of their residuals",
        "power": "informed",
        "money_share": null
      },
      {
        "role": "Processors (3)",
        "does": "Send the monthly residual reports",
        "power": "informed",
        "money_share": null
      }
    ],
    "users": {
      "who": "Your finance person and your CEO, with agents seeing their own numbers",
      "why": "Finance stops spending 2 days a month on Excel, the CEO approves with confidence, and agents see how their payout was worked out."
    },
    "new_flow": [
      {
        "label": "All 3 residual reports in one place"
      },
      {
        "label": "Merchants matched to agents"
      },
      {
        "label": "Splits calculated from contracts"
      },
      {
        "label": "CEO reviews and approves"
      },
      {
        "label": "Agents see their own statement"
      }
    ],
    "app_name": "One residual payout desk",
    "pattern": "trusted_answers",
    "data_issues": [
      "multiple_sources",
      "manual_copying",
      "no_shared_ids",
      "unstructured_docs",
      "sensitive_data"
    ],
    "risks": [
      {
        "title": "Splits in contract PDFs may not match the Excel tab",
        "severity": "fix_first"
      },
      {
        "title": "Each processor may name or number merchants differently",
        "severity": "watch"
      },
      {
        "title": "Agent pay and merchant data must stay private",
        "severity": "watch"
      }
    ],
    "questions_for_call": [
      "When an agent disputes a number, what is usually wrong: the merchant match, the split, or the processor report?",
      "Do any agents have special deals, like split changes over time, shared merchants, or sub-agents?",
      "How do you know which merchant belongs to which agent today, and who decides when two agents claim one?"
    ]
  },
  "readiness": {
    "score": 16,
    "reasons": [
      "Your data lives in spreadsheets",
      "3 different apps hold the data",
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
        "label": "Numbers calculated by code",
        "weeks": 1
      },
      {
        "label": "The AI explains the numbers",
        "weeks": 1
      },
      {
        "label": "Handover",
        "weeks": 1
      }
    ]
  },
  "time_saved": {
    "before_minutes": 222,
    "after_minutes": 45,
    "after_is_estimate": true
  },
  "locked": [
    "Which tools and AI models",
    "How it is built (architecture)",
    "How I solve each risk",
    "Cost estimate"
  ]
};
