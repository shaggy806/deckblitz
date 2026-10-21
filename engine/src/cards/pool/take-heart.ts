import { defineCard } from "../define.js";

// EDHREC rank 20580.
//
// The attackers are counted as it resolves; with none, the creature still
// gets +2/+2 (the ruling).

export default defineCard({
  name: "Take Heart",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. You gain 1 life for each attacking creature you control.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "gain-life",
        amount: { countOf: { type: "creature", controlledBy: "you", attacking: true } },
      },
    ],
  },
});
