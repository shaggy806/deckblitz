import { defineCard } from "../define.js";

// Rulings: the +1's life loss happens even to an opponent who couldn't
// discard; the −3 may take a creature you already control; and whether the
// creature has mana value 3 or less is checked only as the delayed ability
// resolves in the end step. `sacrifice-target` sacrifices it only while you
// still control it.
const PLUS = "+1: Each opponent discards a card and loses 2 life.";
const MINUS =
  "−3: Gain control of target creature until end of turn. Untap it. It gains haste until end of turn. Sacrifice it at the beginning of the next end step if it has mana value 3 or less.";
const ULT = "−8: Each opponent loses life equal to the number of cards in their graveyard.";

export default defineCard({
  name: "Angrath, the Flame-Chained",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Angrath"],
  loyalty: 4,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 1 },
          { kind: "lose-life", amount: 2, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 3 } } },
              then: { kind: "sacrifice-target", target: 0 },
            },
            text: "Sacrifice the creature Angrath gained control of if it has mana value 3 or less.",
          },
        ],
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "lose-life", amount: { graveyardSize: "each" }, who: "each-opponent" },
      resolve: null,
      text: ULT,
    },
  ],
});
