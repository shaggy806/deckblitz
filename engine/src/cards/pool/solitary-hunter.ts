import { defineCard } from "../define.js";

// EDHREC rank 27998.

export default defineCard({
  name: "Solitary Hunter",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Werewolf"],
  power: 3,
  toughness: 4,
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
  faces: ["Solitary Hunter", "One of the Pack"],
  transform: true,
});
