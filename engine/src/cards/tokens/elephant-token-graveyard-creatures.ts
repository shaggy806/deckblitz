import { defineCard } from "../define.js";

const TEXT =
  "This token's power and toughness are each equal to the number of creature cards in its controller's graveyard.";

/** Elephant Resurgence's green Elephant: a star/star whose ability counts the
 * creature cards in its controller's graveyard (the cards there are the ones
 * they own), live — not locked in as it's created (the ruling). No token
 * printing of its own: the art is the vanilla Elephant token's. */
export default defineCard({
  name: "Elephant Token (Graveyard Creatures)",
  tokenName: "Elephant Token",
  art: "e2030e94-c186-4b7d-9924-6d53440244fe",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: TEXT,
    },
  ],
});
