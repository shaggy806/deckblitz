import { defineCard } from "../define.js";

// −6: you separate (rule 700.3), the targeted player chooses the pile they
// sacrifice. A token stack is separated token by token.

const PLUS_TEXT = "+1: Each player discards a card.";
const MINUS_TEXT = "−2: Target player sacrifices a creature.";
const ULT_TEXT =
  "−6: Separate all permanents target player controls into two piles. That player sacrifices all permanents in the pile of their choice.";

export default defineCard({
  name: "Liliana of the Veil",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Liliana"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "separate-into-piles",
        objects: { permanents: {}, whose: { target: 0 } },
        chooser: { target: 0 },
        chosen: { effect: { kind: "sacrifice-target", target: 0, byItsController: true } },
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
