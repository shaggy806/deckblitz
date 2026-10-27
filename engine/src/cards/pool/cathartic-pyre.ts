import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 4161. The second mode is Kinetic Augur's "discard up to two
// cards, then draw that many cards": how many (0, 1 or 2) is chosen as the
// spell resolves, and the cards go in one discard.

const discardThenDraw = (n: number): EffectSpec => ({
  kind: "sequence",
  effects: [
    { kind: "discard", target: "you", amount: n },
    { kind: "draw", amount: { thisWay: "discarded" } },
  ],
});

export default defineCard({
  name: "Cathartic Pyre",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one —\n• Cathartic Pyre deals 3 damage to target creature or planeswalker.\n• Discard up to two cards, then draw that many cards.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Cathartic Pyre deals 3 damage to target creature or planeswalker.",
        targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
      {
        text: "Discard up to two cards, then draw that many cards.",
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
      },
    ],
  },
});
