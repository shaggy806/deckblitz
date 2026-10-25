import { defineCard } from "../define.js";

// EDHREC rank 11377.
//
// Dimensional Exile's exile, on an Aura that enchants a creature you control.

const EXILE_TEXT = "When this Aura enters, exile target creature an opponent controls until this Aura leaves the battlefield.";

export default defineCard({
  name: "Faith Unbroken",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${EXILE_TEXT}\nEnchanted creature gets +2/+2.`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." }],
});
