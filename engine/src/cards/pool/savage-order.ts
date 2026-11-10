import { defineCard } from "../define.js";

// EDHREC rank 5134.
//
// The sacrifice is a mandatory additional cost (rule 601.2f): no creature
// with power 4 or greater, no cast. "It" is the card the search put onto the
// battlefield — nothing found, or a find that couldn't enter, gains nothing —
// and it keeps indestructible until the caster's next turn begins.
export default defineCard({
  name: "Savage Order",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "As an additional cost to cast this spell, sacrifice a creature with power 4 or greater.\n" +
    "Search your library for a Dinosaur creature card, put it onto the battlefield, then shuffle. It gains indestructible until your next turn.",
  additionalCost: { sacrifice: { type: "creature", power: { op: "gte", n: 4 } } },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "search-library", filter: { type: "creature", subtype: "Dinosaur" }, destination: "battlefield", min: 0, max: 1 },
      {
        kind: "grant-keyword-all",
        filter: { thisWay: "put-onto-battlefield" },
        keyword: "indestructible",
        duration: "until-your-next-turn",
      },
    ],
  },
});
