import { defineCard } from "../define.js";

// Aether Revolt. Blocking several creatures at once still gets one {E} (its
// ruling): `blocks` fires once per declared blocker.
const BLOCK_TEXT = "Whenever this creature blocks, you get {E} (an energy counter).";
const DRAW_TEXT = "{T}, Pay {E}{E}{E}: Draw a card.";

export default defineCard({
  name: "Shielded Aether Thief",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Rogue"],
  power: 0,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\n${BLOCK_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: BLOCK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 3 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
