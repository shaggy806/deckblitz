import { defineCard } from "../define.js";

// EDHREC rank 14134.
//
// "When you do" is a reflexive triggered ability (rule 603.12): the token is
// targeted only once {1} has been paid, after the enters trigger resolves.
const TEXT =
  "When this creature enters, you may pay {1}. When you do, create a token that's a copy of target token you control not named Dutiful Replicator.";

export default defineCard({
  name: "Dutiful Replicator",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Assembly-Worker"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to copy a token you control?",
        cost: "{1}",
        effect: {
          kind: "reflexive-trigger",
          targets: [
            { kind: "permanent", whose: "you", filter: { token: true, notName: "Dutiful Replicator" } },
          ],
          effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
          text: "When you do, create a token that's a copy of target token you control not named Dutiful Replicator.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
