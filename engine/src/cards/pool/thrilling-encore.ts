import { defineCard } from "../define.js";

// EDHREC rank 7684. Every graveyard, every creature card in it put there
// from the battlefield this turn — a creature card as it is in the graveyard,
// so a noncreature that was animated when it died stays (the rulings); a
// countered creature spell never entered. Those another player owns enter
// under your control (rule 110.2) and are exiled if you leave (800.4a).

export default defineCard({
  name: "Thrilling Encore",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put onto the battlefield under your control all creature cards in all graveyards that were put there from the battlefield this turn.",
  effect: {
    kind: "return-from-graveyard",
    from: "all-graveyards",
    filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
    destination: "battlefield",
    count: "all",
  },
});
