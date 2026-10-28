import { defineCard } from "../define.js";

// EDHREC rank 22816.

export default defineCard({
  name: "Supreme Inquisitor",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: "Tap five untapped Wizards you control: Search target player's library for up to five cards and exile them. Then that player shuffles.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 5, filter: { subtype: "Wizard", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["player"],
      effect: {
        kind: "search-library",
        whose: { target: 0 },
        filter: {},
        destination: "exile",
        min: 0,
        max: 5,
      },
      resolve: null,
      text: "Tap five untapped Wizards you control: Search target player's library for up to five cards and exile them. Then that player shuffles.",
    },
  ],
});
