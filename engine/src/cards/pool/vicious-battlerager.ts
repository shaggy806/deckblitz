import { defineCard } from "../define.js";

// EDHREC rank 11694.

export default defineCard({
  name: "Vicious Battlerager",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dwarf", "Barbarian"],
  power: 1,
  toughness: 5,
  text: "When this creature enters, you take the initiative.\nSpiked Retribution — Whenever this creature becomes blocked by a creature, that creature's controller loses 5 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this creature enters, you take the initiative.",
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-controller", amount: 5 },
      resolve: null,
      text: "Spiked Retribution — Whenever this creature becomes blocked by a creature, that creature's controller loses 5 life.",
    },
  ],
});
