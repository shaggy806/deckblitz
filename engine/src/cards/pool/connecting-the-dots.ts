import { defineCard } from "../define.js";

// EDHREC rank 9853.

export default defineCard({
  name: "Connecting the Dots",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Whenever a creature you control attacks, exile the top card of your library face down. (You can't look at it.)\n{1}{R}, Discard your hand, Sacrifice this enchantment: Put all cards exiled with this enchantment into their owners' hands.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, sacrifice: "self", do: { kind: "discard-hand", who: "you" } },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: "{1}{R}, Discard your hand, Sacrifice this enchantment: Put all cards exiled with this enchantment into their owners' hands.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "exile-from-library", amount: 1, faceDown: true, linked: true },
      resolve: null,
      text: "Whenever a creature you control attacks, exile the top card of your library face down.",
    },
  ],
});
