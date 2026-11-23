import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, create a 1/1 green and blue Bird creature token with flying for each Bird you control.";
const ANGEL_TEXT = "As long as you control twelve or more Birds, you can't lose the game and opponents can't win the game.";

export default defineCard({
  name: "The Bird Champion",
  manaCost: "{2}{G}{G}{U}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 9,
  toughness: 9,
  keywords: ["defender", "flying"],
  text: `Defender, flying\n${UPKEEP_TEXT}\n${ANGEL_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Green-Blue Bird Token (Flying)",
        count: { countOf: { subtype: "Bird", controlledBy: "you" } },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Bird" }, atLeast: 12, countsSelf: true },
      prohibits: [
        { act: "lose-game", who: "you" },
        { act: "win-game", who: "opponents" },
      ],
      text: ANGEL_TEXT,
    },
  ],
});
