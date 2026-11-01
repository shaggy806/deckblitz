import { defineCard } from "../define.js";

const SACRIFICE_TEXT = "At the beginning of the end step, sacrifice this permanent.";
const TEXT =
  `Whenever you cast a spell from exile, copy it. You may choose new targets for the copy. If it's a permanent spell, the copy gains haste and "${SACRIFICE_TEXT}" (A copy of a permanent spell becomes a token.)`;

// "The copy gains haste and …" is an effect on the copy, not a copy
// exception: it goes on applying to the token the copy becomes (rule
// 400.7a), and a copy of that token has none of it. A copy of an instant or
// sorcery gains nothing (`ifPermanent`).
export default defineCard({
  name: "Nalfeshnee",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast", "Demon"],
  power: 4,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "exile" },
      targets: [],
      effect: {
        kind: "copy-spell",
        target: "trigger-spell",
        newTargets: true,
        gains: {
          keywords: ["haste"],
          triggered: [
            {
              trigger: { on: "step-begins", step: "end", who: "any" },
              targets: [],
              effect: { kind: "sacrifice-source" },
              resolve: null,
              text: SACRIFICE_TEXT,
            },
          ],
          ifPermanent: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
