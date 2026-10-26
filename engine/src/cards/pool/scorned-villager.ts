import { defineCard } from "../define.js";

// EDHREC rank 8506.

export default defineCard({
  name: "Scorned Villager",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 1,
  toughness: 1,
  text: "{T}: Add {G}.\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
  ],
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
  faces: ["Scorned Villager", "Moonscarred Werewolf"],
  transform: true,
});
