import { defineCard } from "../define.js";

// EDHREC rank 12846. Any player's graveyard, but only a card put there from
// the battlefield this turn — a discarded creature card, or a countered
// creature spell, never was (the rulings). A card that has left the
// graveyard and come back since is a new object (rule 400.7) and wasn't.

const TEXT =
  "Choose target creature card in a graveyard that was put there from the battlefield this turn. Put that card onto the battlefield under your control.";

export default defineCard({
  name: "Grim Return",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: TEXT,
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "any",
      filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
    },
  ],
  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
});
