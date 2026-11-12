import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Conjure is MTG Arena's (the `conjure`
// effect): the Power Nine are nine new cards you own, put into your library,
// which is then shuffled.
const ENTER_TEXT = "When Oracle of the Alpha enters the battlefield, conjure the Power Nine into your library, then shuffle.";
const ATTACK_TEXT = "Whenever Oracle of the Alpha attacks, scry 1.";
const POWER_NINE = [
  "Black Lotus",
  "Mox Pearl",
  "Mox Sapphire",
  "Mox Jet",
  "Mox Ruby",
  "Mox Emerald",
  "Ancestral Recall",
  "Time Walk",
  "Timetwister",
] as const;

export default defineCard({
  name: "Oracle of the Alpha",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          ...POWER_NINE.map((name) => ({ kind: "conjure" as const, name, to: "library" as const })),
          { kind: "shuffle-library" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
