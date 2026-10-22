import { defineCard } from "../define.js";

// EDHREC rank 28005.

export default defineCard({
  name: "Pentagram of the Ages",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{4}, {T}: The next time a source of your choice would deal damage to you this turn, prevent that damage.",
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", to: "you", amount: "next-time" },
      resolve: null,
      text: "{4}, {T}: The next time a source of your choice would deal damage to you this turn, prevent that damage.",
    },
  ],
});
