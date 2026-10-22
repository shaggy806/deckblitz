import { defineCard } from "../define.js";

// The aftermath half of Leave // Chance: cast only from a graveyard, then
// exiled (rule 702.127a). Any number is the player's pick, none included.
const FACES = ["Leave // Chance", "Leave", "Chance"];

export default defineCard({
  name: "Chance",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nDiscard any number of cards, then draw that many cards.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: 0, anyNumber: true },
      { kind: "draw", amount: { thisWay: "discarded" } },
    ],
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
