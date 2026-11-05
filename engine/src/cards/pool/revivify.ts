import { defineCard } from "../define.js";

const FROM_BATTLEFIELD_THIS_TURN = {
  type: "creature",
  ownedBy: "you",
  putIntoGraveyardThisTurn: { from: ["battlefield"] },
} as const;

export default defineCard({
  name: "Revivify",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Roll a d20 and add the number of creature cards in your graveyard that were put there from the battlefield this turn.\n" +
    "1—14 | Return all creature cards in your graveyard that were put there from the battlefield this turn to your hand.\n" +
    "15+ | Return those cards from your graveyard to the battlefield.",
  targets: [],
  effect: {
    kind: "roll-dice",
    sides: 20,
    modifier: { countInGraveyard: FROM_BATTLEFIELD_THIS_TURN },
    table: [
      {
        min: 1,
        max: 14,
        effect: { kind: "return-from-graveyard", filter: FROM_BATTLEFIELD_THIS_TURN, destination: "hand", count: "all" },
      },
      {
        min: 15,
        effect: {
          kind: "return-from-graveyard",
          filter: FROM_BATTLEFIELD_THIS_TURN,
          destination: "battlefield",
          count: "all",
        },
      },
    ],
  },
});
