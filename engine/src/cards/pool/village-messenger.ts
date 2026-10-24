import { defineCard } from "../define.js";

// EDHREC rank 15390.

export default defineCard({
  name: "Village Messenger",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
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
  faces: ["Village Messenger", "Moonrise Intruder"],
  transform: true,
});
