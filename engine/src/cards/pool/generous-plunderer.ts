import { defineCard } from "../define.js";

const UPKEEP = "At the beginning of your upkeep, you may create a Treasure token. When you do, target opponent creates a tapped Treasure token.";
const ATTACK = "Whenever this creature attacks, it deals damage to defending player equal to the number of artifacts they control.";

export default defineCard({
  name: "Generous Plunderer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${UPKEEP}\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a Treasure token? Target opponent then creates a tapped Treasure token.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Treasure Token", count: 1 },
            {
              kind: "reflexive-trigger",
              targets: ["opponent"],
              effect: { kind: "create-token", token: "Treasure Token", count: 1, tapped: true, who: "target-controller" },
              text: "When you do, target opponent creates a tapped Treasure token.",
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "damage",
        amount: { countOf: { type: "artifact", controlledBy: "you" }, forPlayer: "trigger-player" },
        who: "trigger-player",
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
