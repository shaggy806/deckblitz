import { defineCard } from "../define.js";

// EDHREC rank 23095.

export default defineCard({
  name: "Hanweir Watchkeep",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Werewolf"],
  power: 1,
  toughness: 5,
  keywords: ["defender"],
  text: "Defender\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
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
  faces: ["Hanweir Watchkeep", "Bane of Hanweir"],
  transform: true,
});
