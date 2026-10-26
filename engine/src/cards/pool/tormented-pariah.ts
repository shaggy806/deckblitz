import { defineCard } from "../define.js";

// EDHREC rank 28580.

export default defineCard({
  name: "Tormented Pariah",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Werewolf"],
  power: 3,
  toughness: 2,
  text: "At the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", none: true },
    },
  ],
  faces: ["Tormented Pariah", "Rampaging Werewolf"],
  transform: true,
});
