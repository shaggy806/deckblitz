import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Apocalypse (APC). EDHREC rank 16913.
//
// The whole hand goes into the library, which is shuffled, then as many cards are drawn as went
// in — none when the hand was empty.
const SHUFFLE_AND_DRAW: EffectSpec = {
  kind: "shuffle-graveyard-into-library",
  target: "you",
  zones: ["hand"],
  drawThatMany: true,
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
