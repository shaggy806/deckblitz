import { defineCard } from "../define.js";

export default defineCard({
  name: "Gatstaf Shepherd",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
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
  faces: ["Gatstaf Shepherd", "Gatstaf Howler"],
  transform: true,
});
