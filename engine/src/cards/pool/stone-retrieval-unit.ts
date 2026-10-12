import { defineCard } from "../define.js";

export default defineCard({
  name: "Stone Retrieval Unit",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 3,
  text: "When this creature enters, create a tapped Powerstone token. (It's an artifact with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
      resolve: null,
      text: "When this creature enters, create a tapped Powerstone token.",
    },
  ],
});
