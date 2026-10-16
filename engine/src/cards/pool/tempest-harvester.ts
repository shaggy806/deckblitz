import { defineCard } from "../define.js";

// EDHREC rank 16408.
const ENERGY_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const LOOT_TEXT = "{T}, Pay {E}: Draw a card, then discard a card.";

export default defineCard({
  name: "Tempest Harvester",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 1,
  text: `${ENERGY_TEXT}\n${LOOT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENERGY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
