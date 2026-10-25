import { defineCard } from "../define.js";

// EDHREC rank 8156.
//
// Rulings:
//   [2014-11-07] Count the number of creature cards in your graveyard as the triggered ability
//     resolves, including Hallowed Spiritkeeper itself if it's still there, to determine how many
//     Spirits are created.

const DIES_TEXT =
  "When this creature dies, create X 1/1 white Spirit creature tokens with flying, where X is the number of creature cards in your graveyard.";

export default defineCard({
  name: "Hallowed Spiritkeeper",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 3,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Spirit Token",
        count: { countInGraveyard: { type: "creature", ownedBy: "you" } },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
