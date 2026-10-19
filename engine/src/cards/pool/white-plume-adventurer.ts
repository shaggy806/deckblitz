import { defineCard } from "../define.js";

// EDHREC rank 3348.

export default defineCard({
  name: "White Plume Adventurer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Orc", "Cleric"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, you take the initiative.\nAt the beginning of each opponent's upkeep, untap a creature you control. If you've completed a dungeon, untap all creatures you control instead.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this creature enters, you take the initiative.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      // Not a target (rule 115.1): chosen as the ability resolves.
      effect: {
        kind: "conditional",
        condition: { kind: "completed-dungeon" },
        then: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
        else: {
          kind: "choose-permanents",
          filter: { type: "creature", controlledBy: "you" },
          min: 1,
          upTo: 1,
          then: { kind: "untap", target: 0 },
          prompt: "Untap a creature you control",
        },
      },
      resolve: null,
      text: "At the beginning of each opponent's upkeep, untap a creature you control. If you've completed a dungeon, untap all creatures you control instead.",
    },
  ],
});
