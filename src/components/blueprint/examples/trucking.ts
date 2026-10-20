import type { Blueprint } from "../types";

// A real blueprint made by the live tool (Claude Opus 5.5 + our rules,
// 2026-10-20) from a trucking company's story. Shown as the example
// before a visitor makes their own, and on the /blueprint page (B6).
// Story: typical small fleet (public research), not a client.
// Not signed: it can't be booked; it only shows what a blueprint looks like.
export const TRUCKING: Blueprint = {
  "version": 1,
  "created": "2026-10-20T15:39:32+00:00",
  "pattern": {
    "id": "data_platform",
    "title": "Data that's ready for AI",
    "promise": "Your data cleaned, connected and kept in one place, so reports and AI answers come from one source of truth."
  },
  "draft": {
    "why": {
      "problem": "Each Monday the office manager spends about 6 hours copying fuel and route data from 3 spreadsheets into one report. By the time the owner reads it, it is already old.",
      "goal": "Give the owner one fresh, trusted view of fuel and routes for all 40 trucks, without hours of copying."
    },
    "old_flow": [
      {
        "label": "Export fuel card data",
        "tool": "Spreadsheets",
        "minutes": null,
        "per": null,
        "pain": false
      },
      {
        "label": "Collect route data",
        "tool": "Spreadsheets",
        "minutes": null,
        "per": null,
        "pain": false
      },
      {
        "label": "Copy 3 sheets into one report",
        "tool": "Spreadsheets",
        "minutes": 360,
        "per": "week",
        "pain": true
      },
      {
        "label": "Match card numbers to plates",
        "tool": "Spreadsheets",
        "minutes": null,
        "per": null,
        "pain": true
      },
      {
        "label": "Owner reads the weekly report",
        "tool": "Spreadsheets",
        "minutes": null,
        "per": null,
        "pain": true
      }
    ],
    "players": [
      {
        "role": "Owner",
        "does": "Reads the report and decides on fuel and routes",
        "power": "decides",
        "money_share": null
      },
      {
        "role": "Office manager",
        "does": "Copies the 3 sheets into one report every Monday",
        "power": "does",
        "money_share": null
      },
      {
        "role": "Dispatchers",
        "does": "Plan the routes for the trucks",
        "power": "does",
        "money_share": null
      }
    ],
    "users": {
      "who": "The owner, the office manager and the dispatchers",
      "why": "The owner needs fresh numbers to decide, and the office manager gets his Monday back."
    },
    "new_flow": [
      {
        "label": "Fuel and route data flow in"
      },
      {
        "label": "Each card is linked to its truck"
      },
      {
        "label": "Report updates by itself"
      },
      {
        "label": "Owner sees fresh numbers anytime"
      }
    ],
    "app_name": "One fleet dashboard",
    "pattern": "data_platform",
    "data_issues": [
      "multiple_sources",
      "manual_copying",
      "no_shared_ids"
    ],
    "risks": [
      {
        "title": "Fuel cards use card numbers, routes use plate numbers",
        "severity": "fix_first"
      },
      {
        "title": "Cards may move between trucks or drivers over time",
        "severity": "watch"
      },
      {
        "title": "Hand-typed sheets may hold gaps or typos",
        "severity": "watch"
      }
    ],
    "questions_for_call": [
      "Is there a list today that says which fuel card belongs to which truck plate, and who keeps it up to date?",
      "Which numbers does the owner look at first in the Monday report, and what decision does he make from them?",
      "Where do the fuel card and route sheets come from: are they downloaded from a provider or typed in by the dispatchers?"
    ]
  },
  "readiness": {
    "score": 40,
    "reasons": [
      "Your data lives in spreadsheets",
      "The apps don't share the same IDs",
      "The same data is kept in several places"
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
        "label": "Your data in one place",
        "weeks": 1
      },
      {
        "label": "Answers and reports on top",
        "weeks": 1
      },
      {
        "label": "Handover",
        "weeks": 1
      }
    ]
  },
  "time_saved": {
    "before_minutes": 360,
    "after_minutes": 35,
    "after_is_estimate": true
  },
  "locked": [
    "Which tools and AI models",
    "How it is built (architecture)",
    "How I solve each risk",
    "Cost estimate"
  ]
};
