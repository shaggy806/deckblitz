import { defineCard } from "../define.js";

// With only colorless permanents (basic lands, face-down permanents, this
// creature itself), nothing is sacrificed (the ruling).

export default defineCard({
  name: "Ugin's Construct",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 5,
  text: "When this creature enters, sacrifice a permanent that's one or more colors.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "you",
        filter: { anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }] },
        count: 1,
      },
      resolve: null,
      text: "When this creature enters, sacrifice a permanent that's one or more colors.",
    },
  ],
});
