import { defineCard } from "../define.js";

// EDHREC rank 20409.

const TEXT =
  "{3}: The next time a source of your choice would deal damage to you this turn, that damage is dealt to target creature you control instead.";

export default defineCard({
  name: "General's Regalia",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "prevent-damage-from-chosen-source", to: "you", amount: "next-time", redirectTo: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
