import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES, CHOSEN_CREATURE_TYPE } from "../helpers.js";

// The type is chosen as the spell resolves (rule 608.2d); the land loses its
// other land types and its rules-text abilities until end of turn (305.7).
export default defineCard({
  name: "Jinx",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target land becomes the basic land type of your choice until end of turn.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-creature-type",
        options: BASIC_LAND_TYPE_CHOICES,
        prompt: "choose a basic land type",
        then: { kind: "add-types", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
