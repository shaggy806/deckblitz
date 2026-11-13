import { defineCard } from "../define.js";

// "A player of your choice" is named as the mana ability is activated (rule
// 605.3b): it's offered once per player, each offer's `manaFor` naming them.
// Paying a cost, the auto-payer taps it for its controller's own {C}.

export default defineCard({
  name: "Victory Chimes",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Untap this artifact during each other player's untap step.\n{T}: A player of your choice adds {C}.",
  static: [
    {
      affects: { scope: "self" },
      untapsDuringOthersUntap: "self",
      text: "Untap this artifact during each other player's untap step.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1, playerOfChoice: true },
      resolve: null,
      text: "{T}: A player of your choice adds {C}.",
    },
  ],
});
