import { defineCard } from "../define.js";

const DIES_TEXT =
  "When this creature dies, you may put it on your choice of the top or bottom of its owner's library.";

// The choice is the ability's controller's — whoever controlled it when it
// died — made as the ability resolves (the ruling), and it finds the card
// only in the graveyard it went to (rule 400.7).
export default defineCard({
  name: "Arashin Sovereign",
  manaCost: "{5}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put Arashin Sovereign into its owner's library?",
        effect: {
          kind: "each-player-may",
          who: "you",
          choices: [
            {
              text: "Put it on top of its owner's library.",
              effect: { kind: "put-on-library", target: "trigger-object", position: "top" },
            },
            {
              text: "Put it on the bottom of its owner's library.",
              effect: { kind: "put-on-library", target: "trigger-object", position: "bottom" },
            },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
