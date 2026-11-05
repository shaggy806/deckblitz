import { defineCard } from "../define.js";

// EDHREC rank 13434.
//
// The difference is never below 0, so an opponent with no more lands than you
// is dealt nothing; the Treasures count the damage actually dealt.

export default defineCard({
  name: "Spiteful Repossession",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Spiteful Repossession deals damage to each opponent who controls more lands than you equal to the difference. Then create a number of Treasure tokens equal to the damage dealt this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "damage",
        who: "each-opponent",
        amount: {
          difference: [
            { countOf: { type: "land", controlledBy: "you" }, forEachPlayer: true },
            { countOf: { type: "land", controlledBy: "you" } },
          ],
        },
      },
      { kind: "create-token", token: "Treasure Token", count: { damageDealtThisWay: true } },
    ],
  },
});
