import { defineCard } from "../define.js";

// "That player" is the player whose upkeep it is (Barbed Wire's shape); domain
// is counted from their side as it resolves, the life first, then the damage.

const TEXT =
  "Domain — At the beginning of each player's upkeep, that player gains 1 life for each basic land type among lands they control. Then this enchantment deals 3 damage to that player.";

export default defineCard({
  name: "Collapsing Borders",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: { basicLandTypes: "active-player" }, who: "active-player" },
          { kind: "damage", amount: 3, who: "active-player" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
