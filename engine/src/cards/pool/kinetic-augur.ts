import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 19273.
//
// Rulings:
//   [2020-06-23] As Kinetic Augur's triggered ability resolves, you choose whether to discard
//     zero, one, or two cards, discard them, and draw that many. You can't discard one card, draw
//     a card, then choose to discard again.
//   [2020-06-23] The ability that defines Kinetic Augur's power works in all zones, not just on
//     the battlefield.
//
// Haughty Djinn's power CDA; Obsessive Astronomer's "discard up to two cards,
// then draw that many cards" (how many is chosen as it resolves).

const POWER_TEXT = "Kinetic Augur's power is equal to the number of instant and sorcery cards in your graveyard.";
const ENTERS_TEXT = "When this creature enters, discard up to two cards, then draw that many cards.";

const discardThenDraw = (n: number): EffectSpec => ({
  kind: "sequence",
  effects: [
    { kind: "discard", target: "you", amount: n },
    { kind: "draw", amount: { thisWay: "discarded" } },
  ],
});

export default defineCard({
  name: "Kinetic Augur",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 0,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\n${POWER_TEXT}\n${ENTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
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
      text: ENTERS_TEXT,
    },
  ],
});
