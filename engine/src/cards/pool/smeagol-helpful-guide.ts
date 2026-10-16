import { defineCard } from "../define.js";

const END_TEXT = "At the beginning of your end step, if a creature died under your control this turn, the Ring tempts you.";
const REVEAL_TEXT =
  "Whenever the Ring tempts you, target opponent reveals cards from the top of their library until they reveal a land card. Put that card onto the battlefield tapped under your control and the rest into their graveyard.";

export default defineCard({
  name: "Sméagol, Helpful Guide",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Horror"],
  power: 4,
  toughness: 2,
  text: `${END_TEXT}\n${REVEAL_TEXT}`,
  triggered: [
    {
      // Whether or not Sméagol was there when it died (the ruling).
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "died", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: END_TEXT,
    },
    {
      trigger: { on: "ring-tempts", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "reveal-until",
        whose: 0,
        filter: { type: "land" },
        put: "battlefield",
        tapped: true,
        underYourControl: true,
        rest: "graveyard",
      },
      resolve: null,
      text: REVEAL_TEXT,
    },
  ],
});
