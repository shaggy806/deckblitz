import { defineCard } from "../define.js";

// EDHREC rank 8198. The dies trigger targets the opponent: with them gone,
// nothing is exiled (the ruling). The card is cast as it resolves or not at
// all, X as 0 (the rulings).
const ENTER_TEXT =
  "When Hidetsugu and Kairi enters, draw three cards, then put two cards from your hand on top of your library in any order.";
const DIES_TEXT =
  "When Hidetsugu and Kairi dies, exile the top card of your library. Target opponent loses life equal to its mana value. If it's an instant or sorcery card, you may cast it without paying its mana cost.";

export default defineCard({
  name: "Hidetsugu and Kairi",
  manaCost: "{2}{U}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ogre", "Demon", "Dragon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "look-and-choose", zone: "hand", min: 2, max: 2, destination: "library-top", leftover: "stay" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 1 },
          {
            kind: "lose-life",
            target: 0,
            amount: { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "exiled" } },
          },
          { kind: "cast-now", from: "exiled-this-way", spell: { typesAnyOf: ["instant", "sorcery"] }, free: true },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
