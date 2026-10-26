import { defineCard } from "../define.js";

const TEXT = "Whenever you cast a white spell or a Plains you control enters, you gain 1 life.";

// "A Plains" is any land with the subtype (the ruling), so a subtype filter.
export default defineCard({
  name: "Staff of the Sun Magus",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["W"] } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Plains" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
