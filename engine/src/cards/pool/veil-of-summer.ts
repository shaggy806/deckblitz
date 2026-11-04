import { defineCard } from "../define.js";

// EDHREC rank 528.
// Rulings:
//   [2019-07-12] A spell or ability that counters spells can still target your spells after Veil
//     of Summer resolves. When that spell or ability resolves, your spell won't be countered, but
//     any additional effects of the countering spell or ability will still happen.
//   [2019-07-12] If your opponents have cast more than one blue or black spell, you still draw
//     only one card as Veil of Summer resolves.
//
// "Can't be countered this turn" changes the game's rules rather than any
// object (rule 611.2c), so it reaches spells already on the stack and spells
// cast later this turn. The hexproof is the other way round: it goes on the
// permanents you control as this resolves.

export default defineCard({
  name: "Veil of Summer",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Draw a card if an opponent has cast a blue or black spell this turn. Spells you control can't be countered this turn. You and permanents you control gain hexproof from blue and from black until end of turn. (You and they can't be the targets of blue or black spells or abilities your opponents control.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "cast-this-turn", who: "opponent", filter: { anyOf: [{ colors: ["U"] }, { colors: ["B"] }] } },
        then: { kind: "draw", amount: 1 },
      },
      { kind: "grant-spells-this-turn", cantBeCountered: true },
      { kind: "grant-player-hexproof", who: "you", from: { colors: ["U", "B"] } },
      {
        kind: "grant-protection",
        asHexproof: true,
        filter: { controlledBy: "you" },
        from: { colors: ["U", "B"] },
        duration: "end-of-turn",
      },
    ],
  },
});
