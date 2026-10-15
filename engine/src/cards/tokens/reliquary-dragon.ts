import { defineCard } from "../define.js";

/**
 * Dragonbroods' Relic's token — "a 4/4 Dragon creature token named Reliquary
 * Dragon that's all colors" with flying, lifelink and an enters trigger. A
 * named token whose name collides with no card, so it's keyed by that name
 * (Cadet's shape).
 */
export default defineCard({
  name: "Reliquary Dragon",
  art: "44465924-8cc2-49a4-bc07-8dbae7570af6",
  colors: ["W", "U", "B", "R", "G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "lifelink"],
  text: "This token is all colors.\nFlying, lifelink\nWhen this token enters, it deals 3 damage to any target.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "When this token enters, it deals 3 damage to any target.",
    },
  ],
});
