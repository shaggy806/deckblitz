import { defineCard } from "../define.js";

// EDHREC rank 5646.
//
// Rulings:
//   [2024-03-08] If you are instructed to put a card into your graveyard from your library without
//     using the word "mill," Raul's first ability won't allow you to cast it.
//   [2024-03-08] You must follow the normal timing permissions and restrictions of the spell you
//     cast from your graveyard.
//   [2024-03-08] You must pay the costs to cast that spell.
const CAST_TEXT =
  "Once during each of your turns, you may cast a spell from among cards in your graveyard that were milled this turn.";
const MILL_TEXT = "{T}: Each player mills a card.";

export default defineCard({
  name: "Raul, Trouble Shooter",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Mutant", "Rogue"],
  power: 1,
  toughness: 4,
  text: `${CAST_TEXT}\n${MILL_TEXT} (They each put the top card of their library into their graveyard.)`,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "graveyard", filter: { milledThisTurn: true }, oncePerTurn: true, yourTurnOnly: true },
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "mill", target: "each-player", amount: 1 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
