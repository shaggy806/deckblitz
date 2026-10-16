import { defineCard } from "../define.js";

// EDHREC rank 7893. Fallout.
//
// "Sacrifice it unless you pay {E}{E}" is Satya, Aetherflux Genius's shape:
// a `may` paying the energy that does nothing, its decline (or too little
// energy) sacrificing Liberty Prime — this object, not a new one. Attacking
// and blocking are two triggers. "Sacrifice an artifact" may be Liberty Prime
// itself.
const COMBAT_TEXT = "Whenever Liberty Prime attacks or blocks, sacrifice it unless you pay {E}{E} (two energy counters).";
const ACTIVATE_TEXT = "{2}, {T}, Sacrifice an artifact: You get {E}{E} and draw a card.";

const keepOrSacrifice = {
  kind: "may",
  prompt: "Pay {E}{E} to keep Liberty Prime? (Otherwise it's sacrificed.)",
  costEnergy: 2,
  effect: { kind: "sequence", effects: [] },
  else: { kind: "sacrifice-source" },
} as const;

export default defineCard({
  name: "Liberty Prime, Recharged",
  manaCost: "{2}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 8,
  toughness: 8,
  keywords: ["vigilance", "trample", "haste"],
  text: `Vigilance, trample, haste\n${COMBAT_TEXT}\n${ACTIVATE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "get-energy", amount: 2 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: ACTIVATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: keepOrSacrifice,
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: keepOrSacrifice,
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
