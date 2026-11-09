import { defineCard } from "../define.js";

// EDHREC rank 4006. Clone Shell's pick with Black Cat's permission: you may
// look at the exiled card, and cast it for as long as it remains exiled if
// it's a creature spell; a non-creature stays there (the rulings).

const FLASH_TEXT = "You may cast creature spells as though they had flash.";
const PLUS_TEXT = "+1: Until your next turn, up to one target creature gains reach and vigilance.";
const MINUS_TEXT =
  "−2: Look at the top three cards of your library. Exile one face down and put the rest on the bottom of your library in any order. For as long as it remains exiled, you may cast it if it's a creature spell.";

export default defineCard({
  name: "Vivien, Champion of the Wilds",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Vivien"],
  loyalty: 4,
  text: `${FLASH_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}`,
  static: [{ affects: { scope: "self" }, castAsThoughFlash: { type: "creature" }, text: FLASH_TEXT }],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "reach", duration: "until-your-next-turn" },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "until-your-next-turn" },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "exile-face-down",
        unlinked: true,
        faceDownLooks: "chooser",
        mayPlay: { duration: "while-exiled", spell: { type: "creature" } },
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
});
