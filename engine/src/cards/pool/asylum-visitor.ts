import { defineCard } from "../define.js";

// EDHREC rank 7262.

export default defineCard({
  name: "Asylum Visitor",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Wizard"],
  power: 3,
  toughness: 1,
  madness: { cost: "{1}{B}" },
  text: "At the beginning of each player's upkeep, if that player has no cards in hand, you draw a card and you lose 1 life.\nMadness {1}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }],
      },
      resolve: null,
      text: "At the beginning of each player's upkeep, if that player has no cards in hand, you draw a card and you lose 1 life.",
      condition: {
        kind: "of-player",
        player: "active-player",
        condition: { kind: "hand-size", atMost: 0 },
      },
    },
  ],
});
