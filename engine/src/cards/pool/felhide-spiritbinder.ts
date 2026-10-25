import { defineCard } from "../define.js";

// EDHREC rank 14142.
//
// The {1}{R} is decided on resolution (the inspired rulings); "an
// enchantment in addition to its other types" is a copy exception, so a
// copy of the token is an enchantment too, while "it gains haste" and the
// end-step exile apply to the token this made only (Saheeli, the Sun's
// Brilliance's and Flameshadow Conjuring's shapes, and this card's rulings).
const TEXT =
  "Inspired — Whenever this creature becomes untapped, you may pay {1}{R}. If you do, create a token that's a copy of " +
  "another target creature, except it's an enchantment in addition to its other types. It gains haste. Exile it at the " +
  "beginning of the next end step.";

export default defineCard({
  name: "Felhide Spiritbinder",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Shaman"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "may",
        prompt: "Pay {1}{R} to create a token that's a copy of the target creature?",
        cost: "{1}{R}",
        effect: {
          kind: "create-token-copy",
          of: 0,
          count: 1,
          who: "you",
          exceptions: { addTypes: ["enchantment"] },
          gains: { keywords: ["haste"] },
          exileAtEndStep: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
