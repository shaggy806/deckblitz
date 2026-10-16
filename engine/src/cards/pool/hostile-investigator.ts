import { investigate } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 13299.
//
// "Whenever one or more players discard one or more cards" is any player's
// discard event (`who: "any"`), and "triggers only once each turn" is the
// trigger's `oncePerTurn`.
const ENTERS_TEXT = "When this creature enters, target opponent discards a card.";
const DISCARD_TEXT =
  "Whenever one or more players discard one or more cards, investigate. This ability triggers only once each turn.";

export default defineCard({
  name: "Hostile Investigator",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Rogue", "Detective"],
  power: 4,
  toughness: 3,
  text: `${ENTERS_TEXT}\n${DISCARD_TEXT} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard", target: 0, amount: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "discards", who: "any" },
      targets: [],
      effect: investigate(),
      resolve: null,
      oncePerTurn: true,
      text: DISCARD_TEXT,
    },
  ],
});
