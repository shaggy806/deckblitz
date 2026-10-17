import { defineCard } from "../define.js";

// EDHREC rank 9490.

export default defineCard({
  name: "Haunt of the Dead Marshes",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Elf"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, scry 1.\n{2}{B}: Return this card from your graveyard to the battlefield tapped. Activate only if you control a legendary creature.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "controls", filter: { type: "creature", supertype: "legendary" }, atLeast: 1 },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: "{2}{B}: Return this card from your graveyard to the battlefield tapped. Activate only if you control a legendary creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "When this creature enters, scry 1.",
    },
  ],
});
