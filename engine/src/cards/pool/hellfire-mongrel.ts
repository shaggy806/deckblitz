import { defineCard } from "../define.js";

// EDHREC rank 23109.

const TEXT = "At the beginning of each opponent's upkeep, if that player has two or fewer cards in hand, this creature deals 2 damage to that player.";

export default defineCard({
  name: "Hellfire Mongrel",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Dog"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atMost: 2 } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
