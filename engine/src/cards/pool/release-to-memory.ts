import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 7606.
// Makes Spirit → "Spirit Token (Colorless)".
//
// Canoptek Scarab Swarm's shape: the count reads the cards this spell itself exiled.

export default defineCard({
  name: "Release to Memory",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target opponent's graveyard. For each creature card exiled this way, create a 1/1 colorless Spirit creature token.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-graveyard", target: 0 },
      {
        kind: "create-token",
        token: "Spirit Token (Colorless)",
        count: { thisWay: "exiled", filter: { type: "creature" } },
      },
    ],
  },
});
