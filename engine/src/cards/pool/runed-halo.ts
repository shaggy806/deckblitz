import { defineCard } from "../define.js";

// EDHREC rank 19047.
//
// Rulings:
//   [2020-06-23] Some cards can have alternative names, such as split cards, adventurer cards,
//     double-faced cards, and so on. You may choose one of the two names the card can have; Runed
//     Halo won't protect you from the other name.
//   [2020-06-23] Runed Halo can't protect you from tokens unless those tokens have the same name
//     as the card name you choose.
//
// "You have protection from the chosen card name": `playerProtection` with a
// filter read off this enchantment (`chosenName`) — anything with that name
// can't target, enchant or damage its controller (rule 702.16b, c, e; a
// name is a quality only because the ability says so, 702.16a).

const CHOOSE = "As this enchantment enters, choose a card name.";
const PROTECT =
  "You have protection from the chosen card name. (You can't be targeted, dealt damage, or enchanted by anything with that name.)";

export default defineCard({
  name: "Runed Halo",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${CHOOSE}\n${PROTECT}`,
  chooseCardNameOnEnter: { aim: "opponent-permanents" },
  static: [
    {
      affects: { scope: "self" },
      playerProtection: { filter: { chosenName: true } },
      text: PROTECT,
    },
  ],
});
