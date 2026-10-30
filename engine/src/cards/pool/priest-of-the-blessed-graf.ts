import { defineCard } from "../define.js";

const END_STEP_TEXT =
  "At the beginning of your end step, create X 1/1 white Spirit creature tokens with flying, where X is the number of opponents who control more lands than you.";

export default defineCard({
  name: "Priest of the Blessed Graf",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: END_STEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Spirit Token",
        count: {
          countPlayers: "each-opponent",
          where: { kind: "player-compare", stat: { controls: { type: "land" } }, compare: "fewer", than: "that-player" },
        },
      },
      resolve: null,
      text: END_STEP_TEXT,
    },
  ],
});
