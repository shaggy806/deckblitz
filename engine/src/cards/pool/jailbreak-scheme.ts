import { defineCard } from "../define.js";

// EDHREC rank 15898.
//
// Spree (rule 702.172a): one or both modes, each with its additional cost,
// followed in printed order. The second mode's permanent's owner picks top
// or bottom (the ruling) — Misleading Motes' shape.
const COUNTER = "+ {3} — Put a +1/+1 counter on target creature. It can't be blocked this turn.";
const LIBRARY = "+ {2} — Target artifact or creature's owner puts it on their choice of the top or bottom of their library.";

export default defineCard({
  name: "Jailbreak Scheme",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `Spree (Choose one or more additional costs.)\n${COUNTER}\n${LIBRARY}`,
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: COUNTER,
        spreeCost: "{3}",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: LIBRARY,
        spreeCost: "{2}",
        targets: ["artifact-or-creature"],
        effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      },
    ],
  },
});
