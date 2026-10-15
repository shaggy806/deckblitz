import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 7492. Tiered (rule 702.183a) — Restoration Magic's shape: a
// `castModal` of exactly one mode, each mode's additional cost its
// `spreeCost`, chosen as the spell is cast.
//
// Rulings:
//   [2025-06-13] If the target creature is a token, the ability still triggers when it dies, but
//     you won't return the token to the battlefield.
//   [2025-06-13] Vincent's Limit Break will overwrite any previous effects that set the creature's
//     power and toughness to specific numbers. Effects that otherwise modify its power and toughness
//     will still apply no matter when they took effect. The same is true for +1/+1 counters.
//
// - The granted trigger is Supernatural Stamina's.
// - "Has the chosen base power and toughness" is an `animate` adding no types:
//   base P/T set in layer 7b until end of turn, so counters and pumps still
//   apply on top (the ruling).
const RETURN_TEXT = "When this creature dies, return it to the battlefield tapped under its owner's control";
const MAIN_TEXT = `Until end of turn, target creature you control gains "${RETURN_TEXT}" and has the chosen base power and toughness.`;
const GALIAN = "• Galian Beast — {0} — 3/2.";
const GIGAS = "• Death Gigas — {1} — 5/2.";
const HELLMASKER = "• Hellmasker — {3} — 7/2.";

const limitBreak = (power: number): EffectSpec => ({
  kind: "sequence",
  effects: [
    {
      kind: "grant-triggered",
      target: 0,
      duration: "end-of-turn",
      ability: {
        trigger: { on: "dies", who: "self" },
        targets: [],
        effect: { kind: "put-onto-battlefield", target: "trigger-object", enterTapped: true },
        resolve: null,
        text: RETURN_TEXT,
      },
    },
    {
      kind: "animate",
      target: 0,
      power,
      toughness: 2,
      addTypes: [],
      addSubtypes: [],
      duration: "end-of-turn",
    },
  ],
});

export default defineCard({
  name: "Vincent's Limit Break",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Tiered (Choose one additional cost.)\n${MAIN_TEXT}\n${GALIAN}\n${GIGAS}\n${HELLMASKER}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: GALIAN, spreeCost: "{0}", targets: ["creature-you-control"], effect: limitBreak(3) },
      { text: GIGAS, spreeCost: "{1}", targets: ["creature-you-control"], effect: limitBreak(5) },
      { text: HELLMASKER, spreeCost: "{3}", targets: ["creature-you-control"], effect: limitBreak(7) },
    ],
  },
});
