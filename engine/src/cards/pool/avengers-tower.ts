import { defineCard } from "../define.js";

// EDHREC rank 7151.
//
// "A Hero source": a card's ability in any zone (rule 109.2a), as Jasmine
// Dragon Tea Shop's "Ally source".

const HERO_MANA_TEXT =
  "{T}: Add one mana of any color. Spend this mana only to cast a Hero spell or to activate an ability of a Hero source.";
const LOOK_TEXT =
  "{4}, {T}: Look at the top three cards of your library. You may reveal a Hero card from among them and put it into your hand. Put the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Avengers Tower",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${HERO_MANA_TEXT}\n${LOOK_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: {
          spell: { subtype: "Hero" },
          abilityOf: { subtype: "Hero" },
          abilityOfAnyZone: true,
          text: "Spend this mana only to cast a Hero spell or to activate an ability of a Hero source.",
        },
      },
      resolve: null,
      text: HERO_MANA_TEXT,
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { subtype: "Hero" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
