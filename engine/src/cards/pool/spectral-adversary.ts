import { defineCard } from "../define.js";

// EDHREC rank 14852. The reflexive ability's targets are chosen as it goes on
// the stack, up to the number of times paid (rules 603.12, 603.3d — its ruling).
const PHASE_TEXT =
  "When you pay this cost one or more times, put that many +1/+1 counters on this creature, then up to that many other target artifacts, creatures, and/or enchantments phase out.";
const ETB_TEXT = `When this creature enters, you may pay {1}{U} any number of times. ${PHASE_TEXT}`;

export default defineCard({
  name: "Spectral Adversary",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{U} any number of times for that many counters and phased-out permanents?",
        cost: "{1}{U}",
        costTimes: true,
        effect: {
          kind: "reflexive-trigger",
          targets: [
            {
              kind: "any-number",
              of: {
                kind: "other",
                of: { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } },
              },
              max: "x",
            },
          ],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
              { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "phase-out", target: 0 } },
            ],
          },
          text: PHASE_TEXT,
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
