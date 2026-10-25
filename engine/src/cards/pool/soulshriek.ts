import { defineCard } from "../define.js";

// EDHREC rank 26127. Gnarlroot Pallbearer's graveyard count as +X/+0, then In
// Thrall to the Pit's delayed sacrifice of the same target.

export default defineCard({
  name: "Soulshriek",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature you control gets +X/+0 until end of turn, where X is the number of creature cards in your graveyard. Sacrifice that creature at the beginning of the next end step.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt",
        target: 0,
        power: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "sacrifice-target", target: 0 },
        text: "Sacrifice the creature Soulshriek targeted.",
      },
    ],
  },
});
