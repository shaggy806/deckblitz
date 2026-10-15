import { defineCard } from "../define.js";

// EDHREC rank 20739.

export default defineCard({
  name: "Professional Wrestler",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Performer"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")\nThis creature can't be blocked by more than one creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Treasure token.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      blockedByAtMostOne: true,
      text: "This creature can't be blocked by more than one creature.",
    },
  ],
});
