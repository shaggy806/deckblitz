import { defineCard } from "../define.js";

// EDHREC rank 13397.
//
// "If it was attacking" asks the permanent as it last existed on the
// battlefield (rule 608.2h) — the target condition reads its snapshot once
// it has gone to the hand.

export default defineCard({
  name: "Desculpting Blast",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target nonland permanent to its owner's hand. If it was attacking, create a 1/1 colorless Drone artifact creature token with flying and \"This token can block only creatures with flying.\"",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { attacking: true } },
        then: { kind: "create-token", token: "Drone Token", count: 1 },
      },
    ],
  },
});
