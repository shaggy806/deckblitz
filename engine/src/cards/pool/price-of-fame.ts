import { defineCard } from "../define.js";

// EDHREC rank 4563.
//
// Rulings:
//   [2018-10-05] Price of Fame can target a creature that's indestructible. It won't be destroyed,
//     but you'll surveil.
//   [2018-10-05] You'll surveil before resolving any abilities that trigger on the target creature
//     dying.
//   [2018-10-05] Price of Fame's mana value is 4, even if it costs {2} less to cast.
//   [2024-01-12] You perform the actions stated on a card in sequence. For some spells and
//     abilities, you'll surveil last. For others, you'll surveil and then perform other actions.
//   [2024-01-12] When you surveil, you may put all the cards you look at back on top of your
//     library, you may put all of those cards into your graveyard, or you may put some of those
//     cards on top and the rest of them into your graveyard.
//   [2024-01-12] Some spells that instruct you to surveil require targets. You can't cast a spell
//     without choosing legal targets. If all of those targets become illegal, the spell doesn't
//     resolve and you won't surveil.

export default defineCard({
  name: "Price of Fame",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if it targets a legendary creature.\nDestroy target creature.\nSurveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  targets: ["creature"],
  targetCostReduction: { filter: { supertype: "legendary", type: "creature" }, reduceGeneric: 2 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "surveil", amount: 2 },
    ],
  },
});
