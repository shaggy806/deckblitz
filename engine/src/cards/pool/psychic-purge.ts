import { defineCard } from "../define.js";

// EDHREC rank 28661. The discard trigger works from the graveyard the card
// was discarded into (rule 113.6k), only when an opponent's spell or ability
// caused the discard — its effect or a cost of it — never your own, nor the
// cleanup step's (rule 514.1). "That player" is the one whose spell or
// ability it was.

const DISCARD = "When a spell or ability an opponent controls causes you to discard Psychic Purge, that player loses 5 life.";

export default defineCard({
  name: "Psychic Purge",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `Psychic Purge deals 1 damage to any target.\n${DISCARD}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 1, target: 0 },
  triggered: [
    {
      trigger: { on: "this-discarded", byOpponent: true },
      targets: [],
      effect: { kind: "lose-life", amount: 5, who: "trigger-player" },
      resolve: null,
      text: DISCARD,
    },
  ],
});
