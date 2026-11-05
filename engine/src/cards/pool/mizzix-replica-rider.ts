import { defineCard } from "../define.js";

// EDHREC rank 10638. Nalfeshnee's gains on the copy, behind a payment.

const SACRIFICE_TEXT = "At the beginning of your end step, sacrifice this permanent.";
const TEXT = `Whenever you cast a spell from anywhere other than your hand, you may pay {1}{U/R}. If you do, copy that spell and you may choose new targets for the copy. If the copy is a permanent spell, it gains haste and "${SACRIFICE_TEXT}" (A copy of a permanent spell becomes a token.)`;

export default defineCard({
  name: "Mizzix, Replica Rider",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", notFrom: "hand" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{U/R} to copy that spell?",
        cost: "{1}{U/R}",
        effect: {
          kind: "copy-spell",
          target: "trigger-spell",
          newTargets: true,
          gains: {
            keywords: ["haste"],
            triggered: [
              {
                trigger: { on: "step-begins", step: "end", who: "you" },
                targets: [],
                effect: { kind: "sacrifice-source" },
                resolve: null,
                text: SACRIFICE_TEXT,
              },
            ],
            ifPermanent: true,
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
