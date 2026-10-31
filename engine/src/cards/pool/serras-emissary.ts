import { CARD_TYPE_CHOICES } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 2409.
//
// Rulings:
//   [2021-06-18] You may choose any card type. The ones that may appear in a normal game of Magic
//     are artifact, battle, creature, enchantment, instant, kindred, land, planeswalker, and
//     sorcery. Supertypes such as snow and basic may not be chosen. Subtypes such as Angel, Aura,
//     and Forest also may not be chosen.
//   [2021-06-18] The card type choice is a replacement effect, not a triggered ability. It doesn't
//     use the stack and can't be responded to. Notably, if you choose instant, your opponent can't
//     try to cast an instant on the Emissary before it has protection.
//
// "Choose a card type": rule 205.2a's, as `chooseOnEnter` (every card type an
// object in this game can have; the others — plane, scheme … — name nothing
// and change nothing). "You and creatures you control have protection from
// the chosen card type": the player's half is `playerProtection` (rule
// 702.16b, c, e), the creatures' half a `protection` on each — both reading
// the chosen word (`chosenCardType`).

const CHOOSE = "As this creature enters, choose a card type.";
const PROTECT = "You and creatures you control have protection from the chosen card type.";

export default defineCard({
  name: "Serra's Emissary",
  manaCost: "{4}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${CHOOSE}\n${PROTECT}`,
  chooseOnEnter: [...CARD_TYPE_CHOICES],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      protection: { chosenCardType: true },
      text: PROTECT,
    },
    {
      affects: { scope: "self" },
      playerProtection: { chosenCardType: true },
      text: PROTECT,
    },
  ],
});
