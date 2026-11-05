import { defineCard } from "../define.js";

const YOURS = "At the beginning of your upkeep, if you have no cards in hand, each opponent loses 2 life.";
const THEIRS = "At the beginning of each opponent's upkeep, if that player has no cards in hand, they lose 2 life.";

export default defineCard({
  name: "Hollowborn Barghest",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Dog"],
  power: 7,
  toughness: 6,
  text: `${YOURS}\n${THEIRS}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "hand-size", atMost: 0 },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "each-opponent" },
      resolve: null,
      text: YOURS,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atMost: 0 } },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "active-player" },
      resolve: null,
      text: THEIRS,
    },
  ],
});
