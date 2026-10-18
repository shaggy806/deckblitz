import { defineCard } from "../define.js";

// EDHREC rank 9628. Tiered (rule 702.183a) is spree's machinery with exactly
// one mode — Thunder Magic's shape. Blizzara's creature's owner, not its
// controller, picks top or bottom (Misleading Motes' shape).
const BLIZZARD = "• Blizzard — {0} — Return target creature to its owner's hand.";
const BLIZZARA = "• Blizzara — {2} — Target creature's owner puts it on their choice of the top or bottom of their library.";
const BLIZZAGA = "• Blizzaga — {5}{U} — Target creature's owner shuffles it into their library.";

export default defineCard({
  name: "Ice Magic",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Tiered (Choose one additional cost.)\n${BLIZZARD}\n${BLIZZARA}\n${BLIZZAGA}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: BLIZZARD, spreeCost: "{0}", targets: ["creature"], effect: { kind: "return-to-hand", target: 0 } },
      {
        text: BLIZZARA,
        spreeCost: "{2}",
        targets: ["creature"],
        effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      },
      { text: BLIZZAGA, spreeCost: "{5}{U}", targets: ["creature"], effect: { kind: "shuffle-into-library", target: 0 } },
    ],
  },
});
