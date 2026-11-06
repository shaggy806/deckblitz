import { defineCard } from "../define.js";

// EDHREC rank 30624.

const ANY_TEXT = "{T}: Add one mana of any color.";
const BATTLEFRONT_TEXT =
  "Battlefront — {T}: Choose a color. Add an amount of mana of that color equal to the number of opponents you " +
  "attacked this turn.";

export default defineCard({
  name: "The Beacon of Kahless",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${ANY_TEXT}\n${BATTLEFRONT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: ANY_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: { turnStat: "opponents-attacked" } },
      resolve: null,
      text: BATTLEFRONT_TEXT,
    },
  ],
});
