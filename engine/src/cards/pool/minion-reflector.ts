import { defineCard } from "../define.js";

// Shards of Alara (ALA).
//
// {2} is paid as the trigger resolves (Flameshadow Conjuring's shape); the
// token copies the creature — as it last existed, if it has left — with
// haste and the end-step sacrifice as copiable exceptions (Chandra,
// Flameshaper's +1; the rulings).

const SACRIFICE_TEXT = "At the beginning of the end step, sacrifice this permanent.";
const TEXT = `Whenever a nontoken creature you control enters, you may pay {2}. If you do, create a token that's a copy of that creature, except it has haste and "${SACRIFICE_TEXT}"`;

export default defineCard({
  name: "Minion Reflector",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: false, type: "creature" },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to create a token that's a copy of that creature?",
        cost: "{2}",
        effect: {
          kind: "create-token-copy",
          of: "trigger-object",
          count: 1,
          who: "you",
          exceptions: {
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
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
