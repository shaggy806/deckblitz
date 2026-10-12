import { defineCard } from "../define.js";

// Its token is Kuja's: the same 0/1 black Wizard that pings each opponent.
// "If this spell was cast from your hand" is Approach of the Second Sun's
// source condition.
export default defineCard({
  name: "Transpose",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  rebound: true,
  text:
    "Draw a card, then discard a card. You lose 1 life. If this spell was cast from your hand, create a 0/1 black Wizard creature token with \"Whenever you cast a noncreature spell, this token deals 1 damage to each opponent.\"\n" +
    "Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "discard", target: "you", amount: 1 },
      { kind: "lose-life", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { castFrom: "hand" } },
        then: { kind: "create-token", token: "Wizard Token (Kuja)", count: 1 },
      },
    ],
  },
});
