import { defineCard } from "../define.js";

// EDHREC rank 14251.

const ENTERS_TEXT =
  "When this artifact enters, search your library for a basic Mountain, Plains, or Swamp card, reveal it, put it into your hand, then shuffle.";
const TOKENS_TEXT =
  "{2}{R}{W}{B}, {T}, Sacrifice this artifact: Create three 1/1 red Warrior creature tokens. They gain menace and haste until end of turn. Activate only as a sorcery.";

export default defineCard({
  name: "Mardu Monument",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS_TEXT}\n${TOKENS_TEXT} (A creature with menace can't be blocked except by two or more creatures.)`,
  activated: [
    {
      cost: { mana: "{2}{R}{W}{B}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Red Warrior Token", count: 3, gainUntilEndOfTurn: ["menace", "haste"] },
      resolve: null,
      text: TOKENS_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land", subtypes: ["Mountain", "Plains", "Swamp"] },
        destination: "hand",
        reveal: true,
        min: 0,
        max: 1,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
