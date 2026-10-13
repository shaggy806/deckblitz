import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 4893.
//
// Rulings:
//   [2023-07-28] To choose a creature type, you must choose an existing creature type, such as
//     Vampire or Knight. You can't choose multiple creature types, such as "Vampire Knight." Card
//     types such as artifact can't be chosen, nor can subtypes that aren't creature types, such as
//     Jace, Vehicle, or Treasure.
//   [2023-07-28] The choice of creature type is made as Titan of Littjara enters the battlefield.
//     Players can't respond to this choice. Titan of Littjara's second ability starts applying
//     immediately.

const DRAW_TEXT =
  "Whenever this creature enters or attacks, you may draw a card for each other creature you control that shares a creature type with it. If you do, discard a card.";
// "It" is the Titan, the trigger object of both its own triggers: its
// creature types as it is (or last was), the chosen one among them
// (Heirloom Blade's `sharesCreatureTypeWith`). "If you do" is having drawn:
// choosing to draw none discards nothing.
const DRAW = {
  kind: "may",
  prompt: "Draw a card for each other creature you control that shares a creature type with it, then discard a card?",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "draw",
        amount: {
          countOf: { type: "creature", controlledBy: "you", sharesCreatureTypeWith: "trigger-object" },
          excludeSelf: true,
        },
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "drawn" },
        then: { kind: "discard", target: "you", amount: 1 },
      },
    ],
  },
} as const satisfies EffectSpec;

export default defineCard({
  name: "Titan of Littjara",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 6,
  toughness: 6,
  text: "As this creature enters, choose a creature type.\nThis creature is the chosen type in addition to its other types.\nWhenever this creature enters or attacks, you may draw a card for each other creature you control that shares a creature type with it. If you do, discard a card.",
  chooseCreatureTypeOnEnter: true,
  static: [
    {
      // In place as soon as the type is chosen, as it enters (the ruling).
      affects: { scope: "self" },
      addsChosenCreatureType: true,
      text: "This creature is the chosen type in addition to its other types.",
    },
  ],
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: DRAW, resolve: null, text: DRAW_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: DRAW, resolve: null, text: DRAW_TEXT },
  ],
});
