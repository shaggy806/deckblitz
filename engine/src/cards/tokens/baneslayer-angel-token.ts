import { defineCard } from "../define.js";

/** The Baneslayer Angel token (Balefang the Unslayable): a copy of the card
 * Baneslayer Angel — named Baneslayer Angel, its {3}{W}{W} mana cost and all. */
export default defineCard({
  name: "Baneslayer Angel Token",
  tokenName: "Baneslayer Angel",
  art: "4bd3014b-94bb-4a9f-92cf-239a2dcc7e97",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "first-strike", "lifelink"],
  text: "Flying, first strike, lifelink, protection from Demons and from Dragons\n(This token's mana cost is {3}{W}{W}.)",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { anyOf: [{ subtype: "Demon" }, { subtype: "Dragon" }] } },
      text: "Protection from Demons and from Dragons",
    },
  ],
});
