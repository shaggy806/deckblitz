import { defineCard } from "../define.js";

// EDHREC rank 21491. "This creature or enchanted creature attacks" is one
// ability on two triggers (Spiteful Returned's shape).
const ATTACK_TEXT = "Whenever this creature or enchanted creature attacks, tap target creature an opponent controls.";

export default defineCard({
  name: "Heliod's Emissary",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Elk"],
  power: 3,
  toughness: 3,
  bestow: "{6}{W}",
  text: `Bestow {6}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\n${ATTACK_TEXT}\nEnchanted creature gets +3/+3.`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "attacks", who: "attached" },
      sameAbilityAs: 0,
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: "Enchanted creature gets +3/+3." }],
});
