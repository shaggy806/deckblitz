import { defineCard } from "../define.js";

/** The Tarmogoyf token (Disa the Restless, Tarmogoyf Nest): a copy of the
 * card Tarmogoyf in the Oracle card reference, so a {1}{G} green Lhurgoyf —
 * its mana value is 2 (the token's own reminder: "This token's mana cost is
 * {1}{G}") — with Tarmogoyf's characteristic-defining ability. */
const TEXT =
  "Tarmogoyf's power is equal to the number of card types among cards in all graveyards and its " +
  "toughness is equal to that number plus 1.";

export default defineCard({
  name: "Tarmogoyf Token",
  art: "f26e1f55-284c-4540-bf5c-ebc7ab9687ab",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 1,
  text: `${TEXT}\n(This token's mana cost is {1}{G}.)`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { cardTypesInGraveyard: {} }, plusPower: 0, plusToughness: 1 },
      text: TEXT,
    },
  ],
});
