import { defineCard } from "../define.js";

const TEXT = "Whenever you cast a blue spell or an Island you control enters, you gain 1 life.";

// "An Island" is any land with the subtype (the ruling), so a subtype filter.
export default defineCard({
  name: "Staff of the Mind Magus",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Island" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
