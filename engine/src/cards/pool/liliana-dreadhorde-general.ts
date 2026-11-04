import { defineCard } from "../define.js";

// EDHREC rank 778.
//
// −9 is Cataclysm's `choose-one-of-each` over the six permanent types (rule
// 110.4), battles having come after the card's rulings: the next opponent in
// turn order chooses first, one permanent may stand for each type it has, and
// everything unchosen goes at once.
const DIES_TEXT = "Whenever a creature you control dies, draw a card.";
const PLUS_TEXT = "+1: Create a 2/2 black Zombie creature token.";
const MINUS_TEXT = "−4: Each player sacrifices two creatures of their choice.";
const ULT_TEXT = "−9: Each opponent chooses a permanent they control of each permanent type and sacrifices the rest.";

export default defineCard({
  name: "Liliana, Dreadhorde General",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Liliana"],
  loyalty: 6,
  text: `${DIES_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 2 },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "choose-one-of-each",
        who: "each-opponent",
        slots: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"],
        filter: {},
        rest: "sacrifice",
        prompt: "Choose a permanent of each permanent type to keep — the rest are sacrificed",
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
