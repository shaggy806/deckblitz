import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 14408. "A creature dealt damage this way": damage
// prevented was never dealt, so a creature whose damage was prevented can
// still be regenerated; a player or planeswalker target isn't a creature.

export default defineCard({
  name: "Incinerate",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Incinerate deals 3 damage to any target. A creature dealt damage this way can't be regenerated this turn.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "prohibit", regeneration: true, dealtDamageThisWay: "creature" },
    ],
  },
});
