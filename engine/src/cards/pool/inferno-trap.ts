import { defineCard } from "../define.js";

export default defineCard({
  name: "Inferno Trap",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If you've been dealt damage by two or more creatures this turn, you may pay {R} rather than pay this spell's mana cost.\nInferno Trap deals 4 damage to target creature.",
  // Two different creatures, any damage, whoever controlled them (the rulings).
  alternativeCost: {
    mana: "{R}",
    condition: { kind: "turn-history", what: "damaged-by", who: "you", filter: { type: "creature" }, atLeast: 2 },
  },
  targets: ["creature"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
