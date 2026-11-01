import { defineCard } from "../define.js";

// Read as the end step's ability resolves, so a creature that dies in response
// comes back too. Only creature cards of yours put there from the battlefield.

const TEXT =
  "At the beginning of your end step, return to your hand all creature cards in your graveyard that were put there from the battlefield this turn.";

export default defineCard({
  name: "Gleancrawler",
  manaCost: "{3}{B/G}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Insect", "Horror"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `({B/G} can be paid with either {B} or {G}.)\nTrample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
        destination: "hand",
        count: "all",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
