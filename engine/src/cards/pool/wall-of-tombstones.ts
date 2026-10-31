import { defineCard } from "../define.js";

// Legions. Base toughness alone, counted as the trigger resolves (rule
// 608.2h) and kept until a later upkeep sets it again.

const UPKEEP =
  "At the beginning of your upkeep, this creature's base toughness becomes equal to 1 plus the number of creature cards in your graveyard. (This effect lasts indefinitely.)";

export default defineCard({
  name: "Wall of Tombstones",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 1,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        toughness: { sum: [1, { countInGraveyard: { type: "creature", ownedBy: "you" } }] },
        addTypes: [],
        addSubtypes: [],
        duration: "permanent",
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
