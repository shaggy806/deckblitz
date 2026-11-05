import { defineCard } from "../define.js";

// EDHREC rank 24627.

const TEXT =
  "When this creature enters, target opponent reveals their hand. You choose a green or white creature card from it and exile that card.";

export default defineCard({
  name: "Lifebane Zombie",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 3,
  toughness: 1,
  keywords: ["intimidate"],
  text: `Intimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "discard-chosen",
        target: 0,
        filter: { type: "creature", anyOf: [{ colors: ["G"] }, { colors: ["W"] }] },
        destination: "exile",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
