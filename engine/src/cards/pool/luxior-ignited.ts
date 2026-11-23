import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). An Equipment planeswalker, The
// Aetherspark's shape: it has no equip ability, attaching only by its +1, and
// can still be attacked while attached (its rulings). "Each counter" is every
// counter of any kind on it, its loyalty counters included.
const PUMP_TEXT = "Equipped creature gets +1/+1 for each counter on Luxior, Ignited.";
const PLUS_TEXT = "+1: Attach this Equipment to up to one target creature you control.";
const MINUS_TEXT = "−2: Equipped creature gets +2/+2 and gains double strike until end of turn.";

export default defineCard({
  name: "Luxior, Ignited",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "planeswalker"],
  subtypes: ["Equipment", "Luxior"],
  loyalty: 1,
  text: `${PUMP_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { anyCountersOnSource: true, pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "attached", power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "attached", keyword: "double-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
});
