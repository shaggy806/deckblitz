import { defineCard } from "../define.js";

// EDHREC rank 6642.
export default defineCard({
  name: "Atarka's Command",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Choose two —\n• Your opponents can't gain life this turn.\n• Atarka's Command deals 3 damage to each opponent.\n• You may put a land card from your hand onto the battlefield.\n• Creatures you control get +1/+1 and gain reach until end of turn.",
  targets: [],
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Your opponents can't gain life this turn.",
        effect: {
          kind: "timed-static",
          duration: "end-of-turn",
          text: "Your opponents can't gain life this turn.",
          static: [
            {
              affects: { scope: "self" },
              replacement: { event: "would-gain-life", who: "opponent", prevent: true },
              text: "Your opponents can't gain life this turn.",
            },
          ],
        },
      },
      {
        text: "Atarka's Command deals 3 damage to each opponent.",
        effect: { kind: "damage", amount: 3, who: "each-opponent" },
      },
      {
        text: "You may put a land card from your hand onto the battlefield.",
        effect: {
          kind: "look-and-choose",
          zone: "hand",
          min: 0,
          max: 1,
          destination: "battlefield",
          leftover: "stay",
          filter: { type: "land" },
        },
      },
      {
        text: "Creatures you control get +1/+1 and gain reach until end of turn.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 1, toughness: 1, duration: "end-of-turn" },
            { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "reach", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
