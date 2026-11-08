import { defineCard } from "../define.js";

// EDHREC rank 29088.

export default defineCard({
  name: "Kyren Archive",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: "At the beginning of your upkeep, you may exile the top card of your library face down.\n{5}, Discard your hand, Sacrifice this artifact: Put all cards exiled with this artifact into their owner's hand.",
  activated: [
    {
      cost: { mana: "{5}", tap: false, sacrifice: "self", do: { kind: "discard-hand", who: "you" } },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: "{5}, Discard your hand, Sacrifice this artifact: Put all cards exiled with this artifact into their owner's hand.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile the top card of your library face down?",
        effect: { kind: "exile-from-library", amount: 1, faceDown: true, linked: true },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may exile the top card of your library face down.",
    },
  ],
});
