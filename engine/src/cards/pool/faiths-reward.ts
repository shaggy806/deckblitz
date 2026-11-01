import { defineCard } from "../define.js";

// Your graveyard only, every permanent card in it that was put there from the
// battlefield this turn and is still there; a card discarded, milled or
// countered this turn never entered, and one that left the graveyard and came
// back is a new object (rule 400.7).

export default defineCard({
  name: "Faith's Reward",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Return to the battlefield all permanent cards in your graveyard that were put there from the battlefield this turn.",
  effect: {
    kind: "return-from-graveyard",
    filter: { notTypes: ["instant", "sorcery"], putIntoGraveyardThisTurn: { from: ["battlefield"] } },
    destination: "battlefield",
    count: "all",
  },
});
