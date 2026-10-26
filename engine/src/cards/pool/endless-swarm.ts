import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 19295.
//
// Epic (rule 702.50) is the `epic` effect, last in the spell's sequence: each upkeep's copy counts
// the hand again as it resolves.
const TEXT =
  "Create a 1/1 green Snake creature token for each card in your hand.\nEpic (For the rest of the game, you can't cast spells. At the beginning of each of your upkeeps, copy this spell except for its epic ability.)";

export default defineCard({
  name: "Endless Swarm",
  manaCost: "{5}{G}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Snake Token", count: { cardsInHand: "you" } },
      { kind: "epic" },
    ],
  },
});
