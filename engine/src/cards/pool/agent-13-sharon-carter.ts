import { defineCard } from "../define.js";

// EDHREC rank 20384. Black Panther, Claws of Bast's "attacks alone" trigger;
// investigate is a Clue token.
const ALONE_TEXT = "Whenever a creature you control attacks alone, investigate.";

export default defineCard({
  name: "Agent 13, Sharon Carter",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Hero"],
  power: 3,
  toughness: 2,
  text: `${ALONE_TEXT} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: ALONE_TEXT,
    },
  ],
});
