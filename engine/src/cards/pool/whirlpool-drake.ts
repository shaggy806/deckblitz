import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Apocalypse (APC). EDHREC rank 16913.
//
// The whole hand goes into the library (Arjun, the Shifting Flame's shape — to the bottom, then
// the library is shuffled, so where they went doesn't matter), then as many cards are drawn as
// went in.
const SHUFFLE_AND_DRAW: EffectSpec = {
  kind: "sequence",
  effects: [
    {
      kind: "look-and-choose",
      zone: "hand",
      min: { cardsInHand: "you" },
      max: { cardsInHand: "you" },
      destination: "library-bottom",
      leftover: "stay",
    },
    { kind: "shuffle-library" },
    { kind: "draw", amount: { thisWay: "put-on-bottom", who: "you" } },
  ],
};
const ENTERS =
  "When this creature enters, shuffle the cards from your hand into your library, then draw that many cards.";
const DIES =
  "When this creature dies, shuffle the cards from your hand into your library, then draw that many cards.";

export default defineCard({
  name: "Whirlpool Drake",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTERS}\n${DIES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: SHUFFLE_AND_DRAW,
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: SHUFFLE_AND_DRAW,
      resolve: null,
      text: DIES,
    },
  ],
});
