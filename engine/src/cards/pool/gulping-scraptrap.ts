import { defineCard } from "../define.js";

// EDHREC rank 10724.

const TEXT = "When this creature enters or dies, proliferate.";

export default defineCard({
  name: "Gulping Scraptrap",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 4,
  toughness: 4,
  text: "When this creature enters or dies, proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: TEXT,
    },
  ],
});
