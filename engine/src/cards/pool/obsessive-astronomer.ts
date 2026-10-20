import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 25496.
//
// Rulings:
//   [2021-09-24] You may choose to discard no cards when the triggered ability resolves.
//   [2021-09-24] A triggered ability that triggers whenever day becomes night or night becomes
//     day only triggers if it was already either day or night and becomes the other.
//
// "Discard up to two cards" is chosen as the ability resolves — how many,
// then which (Greasewrench Goblin's shape); "that many" is the cards actually
// discarded.

const CHANGE_TEXT =
  "Whenever day becomes night or night becomes day, discard up to two cards, then draw that many cards.";

const discardThenDraw = (n: number): EffectSpec => ({
  kind: "sequence",
  effects: [
    { kind: "discard", target: "you", amount: n },
    { kind: "draw", amount: { thisWay: "discarded" } },
  ],
});

export default defineCard({
  name: "Obsessive Astronomer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  becomesDayAsEnters: true,
  text: `If it's neither day nor night, it becomes day as this creature enters.\n${CHANGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "day-night-changes" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Discard no cards", effect: { kind: "sequence", effects: [] } },
          { text: "Discard one card, then draw a card", effect: discardThenDraw(1) },
          { text: "Discard two cards, then draw that many cards", effect: discardThenDraw(2) },
        ],
      },
      resolve: null,
      text: CHANGE_TEXT,
    },
  ],
});
