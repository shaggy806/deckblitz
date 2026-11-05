import { defineCard } from "../define.js";

// EDHREC rank 5198. "cost-with-x" is any cost containing {X} — a spell's total
// cost, an activated ability's, a special action's — and all of that cost, not
// just its X (the rulings).
const GRANTED = "{T}: Add {C}{C}. Spend this mana only on costs that contain {X}.";
const TEXT = `Strategic Coordinator — Basic lands you control have "${GRANTED}"`;

export default defineCard({
  name: "Nexos",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Tyranid", "Advisor"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", supertype: "basic", controlledBy: "you" } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "add-mana",
            mana: "C",
            amount: 2,
            spendOnly: { purposes: ["cost-with-x"], text: "Spend this mana only on costs that contain {X}." },
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
