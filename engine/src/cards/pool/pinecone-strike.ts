import { defineCard } from "../define.js";

export default defineCard({
  name: "Pinecone Strike",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one or both —\n• Pinecone Strike deals 3 damage to target creature. If that creature would die this turn, exile it instead.\n• Destroy target artifact token.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Pinecone Strike deals 3 damage to target creature. If that creature would die this turn, exile it instead.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: 3, target: 0 },
            { kind: "exile-if-dies-this-turn", target: 0 },
          ],
        },
      },
      {
        text: "Destroy target artifact token.",
        targets: [{ kind: "permanent", filter: { token: true, type: "artifact" } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
