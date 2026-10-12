import { defineCard } from "../define.js";

export default defineCard({
  name: "Argothian Opportunist",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 3,
  toughness: 2,
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
