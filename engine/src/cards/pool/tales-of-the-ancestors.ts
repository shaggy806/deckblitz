import { defineCard } from "../define.js";

const TEXT = "Each player with fewer cards in hand than the player with the most cards in hand draws cards equal to the difference.";

const HAND = { cardsInHand: "each" } as const;

// Every number is read before anyone draws. The player with the most, and
// anyone tied, has a difference of 0: nobody with no difference draws.
export default defineCard({
  name: "Tales of the Ancestors",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `${TEXT}\nForetell {1}{U} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  foretell: { cost: "{1}{U}" },
  targets: [],
  effect: {
    kind: "draw",
    who: "each-player",
    amount: { difference: [{ amongPlayers: "greatest", of: HAND }, HAND] },
  },
});
