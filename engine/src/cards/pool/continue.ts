import { defineCard } from "../define.js";

export default defineCard({
  name: "Continue?",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose up to four target creature cards in your graveyard that were put there from the battlefield this turn. Return them to the battlefield.",
  targets: [
    {
      kind: "any-number",
      max: 4,
      of: {
        kind: "card-in-graveyard",
        whose: "you",
        filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
      },
    },
  ],
  effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "put-onto-battlefield", target: 0 } },
});
