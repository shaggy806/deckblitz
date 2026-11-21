import { defineCard } from "../define.js";

// EDHREC rank 18828.
//
// Up to three targets in any graveyards, each a permanent card put there from
// the battlefield this turn; they return together (one instruction), tapped,
// under their owners' control. Then "for each opponent who controls one or more
// of those permanents" counts each opponent once, however many of them they
// control (`distinct` of `"controller"`), reading the permanents as they are
// once they've entered (rule 608.2h) — a card that didn't make it onto the
// battlefield isn't one of them.
export default defineCard({
  name: "Sudden Salvation",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose up to three target permanent cards in graveyards that were put there from the battlefield this turn. Return them to the battlefield tapped under their owners' control. You draw a card for each opponent who controls one or more of those permanents.",
  targets: [
    {
      kind: "any-number",
      of: {
        kind: "card-in-graveyard",
        whose: "any",
        filter: { notTypes: ["instant", "sorcery"], putIntoGraveyardThisTurn: { from: ["battlefield"] } },
      },
      max: 3,
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
      },
      {
        kind: "draw",
        amount: {
          aggregate: "distinct",
          of: "controller",
          filter: { controlledBy: "opponent" },
          in: { thisWay: "put-onto-battlefield" },
        },
      },
    ],
  },
});
