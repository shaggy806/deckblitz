import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 1761. Transforms into Reflection of Kiki-Jiki.
//
// Chapter II's "you may discard up to two cards. If you do, draw that many"
// is Kinetic Augur's modal: discarding none is the "don't", and the draw
// counts what was discarded. Chapter III is Befriending the Moths': it comes
// back as Reflection of Kiki-Jiki, a new object that's no Saga.

const CHAPTER_I =
  'I — Create a 2/2 red Goblin Shaman creature token with "Whenever this token attacks, create a Treasure token."';
const CHAPTER_II = "II — You may discard up to two cards. If you do, draw that many cards.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

const discardThenDraw = (n: number): EffectSpec => ({
  kind: "sequence",
  effects: [
    { kind: "discard", target: "you", amount: n },
    { kind: "draw", amount: { thisWay: "discarded" } },
  ],
});

export default defineCard({
  name: "Fable of the Mirror-Breaker",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["Fable of the Mirror-Breaker", "Reflection of Kiki-Jiki"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Goblin Shaman Token", count: 1 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Don't discard", effect: { kind: "sequence", effects: [] } },
          { text: "Discard one card, then draw a card", effect: discardThenDraw(1) },
          { text: "Discard two cards, then draw that many cards", effect: discardThenDraw(2) },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
