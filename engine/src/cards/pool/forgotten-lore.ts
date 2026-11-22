import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 28559.
//
// Shrouded Lore's shape, paid in {G}: a `repeat` of the target opponent's
// choice among the cards in your graveyard no earlier pass chose
// (`thisWayScope: "across-passes"`), again for each {G} paid, then the card
// chosen last (`thisWayScope: "last"`) put into your hand.
//
// Rulings:
//   [2008-10-01] After that choice is made, you're given the option to pay {G}. If you do, the
//     targeted opponent must choose a different card, if there is one. (If there isn't one,
//     this part is skipped.) Then you're given the option to pay {G} again. As soon as you
//     decline to pay {G}, the last card that was chosen by the opponent is put into your hand.
//   [2008-10-01] The spell has no knowledge of cards chosen for other spells named Forgotten
//     Lore.

export default defineCard({
  name: "Forgotten Lore",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target opponent chooses a card in your graveyard. You may pay {G}. If you do, repeat this process except that opponent can't choose a card already chosen for Forgotten Lore. Then put the last chosen card into your hand.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "repeat",
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          chooser: { target: 0 },
          min: 1,
          max: 1,
          filter: { notThisWay: "chosen", thisWayScope: "across-passes" },
          destination: "stay",
          leftover: "stay",
          prompt: "Choose a card in their graveyard",
        },
        mayAgain: { cost: "{G}", prompt: "Pay {G} to have them choose another card?" },
      },
      {
        kind: "return-from-graveyard",
        filter: { thisWay: "chosen", thisWayScope: "last" },
        destination: "hand",
        count: "all",
      },
    ],
  },
});
