import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 13313.
//
// "If it's your turn, you may sacrifice a Mountain rather than pay this
// spell's mana cost": an alternative cost (rule 118.9) gated on the turn,
// the Mountain chosen as the cost is paid (601.2h).

export default defineCard({
  name: "Mine Collapse",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "If it's your turn, you may sacrifice a Mountain rather than pay this spell's mana cost.\nMine Collapse deals 5 damage to target creature or planeswalker.",
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { type: "land", subtype: "Mountain" }, text: "a Mountain" },
    condition: { kind: "your-turn" },
  },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", amount: 5, target: 0 },
});
