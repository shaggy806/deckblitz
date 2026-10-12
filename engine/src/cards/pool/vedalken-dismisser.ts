import { defineCard } from "../define.js";

export default defineCard({
  name: "Vedalken Dismisser",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, put target creature on top of its owner's library.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: "When this creature enters, put target creature on top of its owner's library.",
    },
  ],
});
