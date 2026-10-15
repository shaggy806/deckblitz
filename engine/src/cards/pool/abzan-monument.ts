import { defineCard } from "../define.js";

// EDHREC rank 15128.
//
// Rulings:
//   [2025-04-04] If you control no creatures as Abzan Monument's last ability resolves, X is 0. In
//     this case, you'll create a 0/0 white Spirit creature token, which will likely immediately
//     die unless something else is raising its toughness.

const ETB_TEXT =
  "When this artifact enters, search your library for a basic Plains, Swamp, or Forest card, reveal it, put it into your hand, then shuffle.";
const SPIRIT_TEXT =
  "{1}{W}{B}{G}, {T}, Sacrifice this artifact: Create an X/X white Spirit creature token, where X is the greatest toughness among creatures you control. Activate only as a sorcery.";

const GREATEST_TOUGHNESS = {
  aggregate: "max",
  of: "toughness",
  filter: { type: "creature", controlledBy: "you" },
} as const;

export default defineCard({
  name: "Abzan Monument",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${ETB_TEXT}\n${SPIRIT_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}{B}{G}", tap: true, sacrifice: "self" },
      targets: [],
      // X is read as the ability resolves (the ruling: none is 0).
      effect: {
        kind: "create-token",
        token: "Spirit Token (Abzan Monument)",
        count: 1,
        basePt: { power: GREATEST_TOUGHNESS, toughness: GREATEST_TOUGHNESS },
      },
      resolve: null,
      text: SPIRIT_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", subtypes: ["Plains", "Swamp", "Forest"] },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
