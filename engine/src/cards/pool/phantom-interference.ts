import { defineCard } from "../define.js";

// EDHREC rank 12976.
//
// Spree (rule 702.172a): the Spirit is made before the counter is tried (the
// order printed). With only the counter mode chosen and its spell gone, the
// whole spell does nothing (rule 608.2b).
export default defineCard({
  name: "Phantom Interference",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Spree (Choose one or more additional costs.)\n" +
    "+ {3} — Create a 2/2 white Spirit creature token with flying.\n" +
    "+ {1} — Counter target spell unless its controller pays {2}.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "+ {3} — Create a 2/2 white Spirit creature token with flying.",
        spreeCost: "{3}",
        effect: { kind: "create-token", token: "Spirit Token (Phantom Interference)", count: 1 },
      },
      {
        text: "+ {1} — Counter target spell unless its controller pays {2}.",
        spreeCost: "{1}",
        targets: ["spell"],
        effect: { kind: "unless", chooser: 0, options: [{ pay: "{2}", text: "Pay {2}" }], otherwise: { kind: "counter", target: 0 } },
      },
    ],
  },
});
