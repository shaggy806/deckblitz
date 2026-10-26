import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 26723. "Sacrifice a creature" can be Greven
// himself (Kjeldoran Dead's shape).

export default defineCard({
  name: "Commander Greven il-Vec",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Warrior"],
  power: 7,
  toughness: 5,
  keywords: ["fear"],
  text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nWhen Commander Greven il-Vec enters, sacrifice a creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "When Commander Greven il-Vec enters, sacrifice a creature.",
    },
  ],
});
