import { defineCard } from "../define.js";

// "Anywhere other than your hand" is every other zone a spell can be cast
// from — a library, a graveyard, exile, the command zone — read off each
// spell's cast record (`castThisTurn`). Surge itself counts once cast from
// exile for its foretell cost: it's a spell you've cast this turn.
const PARADOX_TEXT = "Paradox — Draw a card for each spell you've cast this turn from anywhere other than your hand.";

export default defineCard({
  name: "Surge of Brilliance",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${PARADOX_TEXT}\nForetell {1}{U} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  foretell: { cost: "{1}{U}" },
  effect: {
    kind: "draw",
    amount: {
      castThisTurn: {
        anyOf: [{ castFrom: "library" }, { castFrom: "graveyard" }, { castFrom: "exile" }, { castFrom: "command" }],
      },
    },
  },
});
