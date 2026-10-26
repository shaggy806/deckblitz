import { defineCard } from "../define.js";

// Betrayers of Kamigawa. EDHREC rank 32201.

const TEXT = "Whenever a player casts a spell, tap this creature.";

export default defineCard({
  name: "Ogre Recluse",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 5,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: { kind: "tap", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
