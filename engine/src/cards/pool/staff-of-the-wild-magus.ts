import { defineCard } from "../define.js";

const TEXT = "Whenever you cast a green spell or a Forest you control enters, you gain 1 life.";

// "A Forest" is any land with the subtype (the ruling), so a subtype filter.
export default defineCard({
  name: "Staff of the Wild Magus",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["G"] } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Forest" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
