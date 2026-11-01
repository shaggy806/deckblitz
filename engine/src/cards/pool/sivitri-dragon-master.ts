import { defineCard } from "../define.js";

const PLUS =
  "+1: Until your next turn, creatures can't attack you or planeswalkers you control unless their controller pays 2 life for each of those creatures.";
const MINUS = "−3: Search your library for a Dragon card, reveal it, put it into your hand, then shuffle.";
const ULTIMATE = "−7: Destroy all non-Dragon creatures.";

// The +1 stays with its controller after Sivitri leaves: it's the resolved
// ability's effect, not a static of hers (rule 611.2).
export default defineCard({
  name: "Sivitri, Dragon Master",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sivitri"],
  loyalty: 4,
  canBeCommander: true,
  text: `${PLUS}\n${MINUS}\n${ULTIMATE}\nSivitri, Dragon Master can be your commander.`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "until-your-next-turn",
        attackTax: { life: 2, covers: "you-and-planeswalkers" },
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "search-library", filter: { subtype: "Dragon" }, destination: "hand", reveal: true, min: 0, max: 1 },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature", notSubtypes: ["Dragon"] } },
      resolve: null,
      text: ULTIMATE,
    },
  ],
});
