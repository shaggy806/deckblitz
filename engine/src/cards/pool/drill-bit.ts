import { defineCard } from "../define.js";

// EDHREC rank 23517. Spectacle (rule 702.137) doesn't change when it can be
// cast — still a sorcery (the ruling).
export default defineCard({
  name: "Drill Bit",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  alternativeCost: {
    mana: "{B}",
    keyword: "spectacle",
    condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
  },
  text: "Spectacle {B} (You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this turn.)\nTarget player reveals their hand. You choose a nonland card from it. That player discards that card.",
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
});
