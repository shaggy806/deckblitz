import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 18825. Spectacle (rule 702.137) doesn't change when it can be
// cast — still a sorcery (the ruling).
export default defineCard({
  name: "Dead Revels",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  alternativeCost: {
    mana: "{1}{B}",
    keyword: "spectacle",
    condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
  },
  text: "Spectacle {1}{B} (You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this turn.)\nReturn up to two target creature cards from your graveyard to your hand.",
  targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
});
