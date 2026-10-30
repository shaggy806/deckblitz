import { defineCard } from "../define.js";

const UNBLOCKABLE_TEXT =
  "{3}{U}: This creature can't be blocked this turn. This ability costs {3} less to activate if there are five or more mana values among cards in your graveyard.";

export default defineCard({
  name: "Sewer Crocodile",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crocodile"],
  power: 4,
  toughness: 6,
  text: UNBLOCKABLE_TEXT,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      costReduction: {
        reduceGeneric: 3,
        condition: {
          kind: "aggregate",
          value: { aggregate: "distinct", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" },
          compare: { op: "gte", n: 5 },
        },
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
  ],
});
