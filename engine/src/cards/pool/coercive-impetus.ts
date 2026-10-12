import { defineCard } from "../define.js";

// EDHREC rank 6827. The Impetus cycle's shape (Shiny Impetus, Parasitic
// Impetus): goaded by the Aura's controller, for as long as it's attached.
const PUMP_TEXT = "Enchanted creature gets +1/+1 and is goaded.";
const ATTACK_TEXT = "Whenever enchanted creature attacks, you draw a card and lose 1 life.";

export default defineCard({
  name: "Coercive Impetus",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT} (It attacks each combat if able and attacks a player other than you if able.)\n${ATTACK_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], goads: true, text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
