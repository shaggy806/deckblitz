import { defineCard } from "../define.js";

// Aether Revolt.
const ATTACK_TEXT = "Whenever this creature attacks, you get {E}{E} (two energy counters).";
const BLINK_TEXT = "Pay {E}{E}: Exile this creature, then return it to the battlefield under its owner's control.";

export default defineCard({
  name: "Aethergeode Miner",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Scout"],
  power: 3,
  toughness: 1,
  text: `${ATTACK_TEXT}\n${BLINK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 2 },
      targets: [],
      effect: { kind: "flicker", target: "source" },
      resolve: null,
      text: BLINK_TEXT,
    },
  ],
});
