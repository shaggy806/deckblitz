import { defineCard } from "../define.js";

const SURVEIL_TEXT =
  "{U}, {T}: Surveil 2. Activate only if a Bird, Frog, Otter, or Rat entered the battlefield under your control this turn.";

export default defineCard({
  name: "Lilypad Village",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n{T}: Add {U}. Spend this mana only to cast a creature spell.\n${SURVEIL_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        spendOnly: { spell: { type: "creature" }, text: "Spend this mana only to cast a creature spell." },
      },
      resolve: null,
      text: "{T}: Add {U}. Spend this mana only to cast a creature spell.",
    },
    {
      // The `entered` turn history reads each entry as it entered, under its
      // controller then — the ruling: what happens to it afterwards (it left,
      // changed control or stopped being a Frog) doesn't matter.
      cost: { mana: "{U}", tap: true },
      condition: { kind: "turn-history", what: "entered", filter: { subtypes: ["Bird", "Frog", "Otter", "Rat"] } },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});
