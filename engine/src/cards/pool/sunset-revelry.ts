import { defineCard } from "../define.js";

// Each "if" is read as its own instruction comes up (rule 608.2c): the life
// gained by the first can settle the second's comparison no further, but the
// third's hand is counted after the tokens are made.

const LIFE = "If an opponent has more life than you, you gain 4 life.";
const CREATURES = "If an opponent controls more creatures than you, create two 1/1 white Human creature tokens.";
const HAND = "If an opponent has more cards in hand than you, draw a card.";

export default defineCard({
  name: "Sunset Revelry",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `${LIFE}\n${CREATURES}\n${HAND}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "player-compare", stat: "life", compare: "fewer", than: "an-opponent" },
        then: { kind: "gain-life", amount: 4 },
      },
      {
        kind: "conditional",
        condition: { kind: "opponent-controls-more", filter: { type: "creature" } },
        then: { kind: "create-token", token: "Human Token", count: 2 },
      },
      {
        kind: "conditional",
        condition: { kind: "player-compare", stat: "hand", compare: "fewer", than: "an-opponent" },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
