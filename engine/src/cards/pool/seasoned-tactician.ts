import { defineCard } from "../define.js";

// EDHREC rank 31502.

export default defineCard({
  name: "Seasoned Tactician",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 3,
  text: "{3}, Exile the top four cards of your library: The next time a source of your choice would deal damage to you this turn, prevent that damage.",
  activated: [
    {
      cost: { mana: "{3}", tap: false, exileTop: 4 },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", to: "you", amount: "next-time" },
      resolve: null,
      text: "{3}, Exile the top four cards of your library: The next time a source of your choice would deal damage to you this turn, prevent that damage.",
    },
  ],
});
