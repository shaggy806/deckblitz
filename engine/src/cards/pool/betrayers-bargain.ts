import { defineCard } from "../define.js";

// EDHREC rank 17966.
export default defineCard({
  name: "Betrayer's Bargain",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice a creature or enchantment or pay {2}.\nBetrayer's Bargain deals 5 damage to target creature. If that creature would die this turn, exile it instead.",
  additionalCost: {
    options: [
      {
        text: "Sacrifice a creature or enchantment",
        sacrifice: { typesAnyOf: ["creature", "enchantment"], controlledBy: "you" },
      },
      { text: "Pay {2}", mana: "{2}" },
    ],
  },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
