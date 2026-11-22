import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 21695.
//
// A `repeat` whose pass is the target opponent's choice of a card in your
// graveyard (a look-and-choose with `chooser`, `destination: "stay"`), among
// the cards no earlier pass chose (`notThisWay: "chosen"` read
// `thisWayScope: "across-passes"`), asked again for each {B} paid
// (`mayAgain.cost`) — whether or not a card was left to choose (the
// ruling: that part is skipped). Then the card chosen last
// (`thisWayScope: "last"`) is put into your hand.
//
// Rulings:
//   [2007-02-01] You target an opponent when you cast Shrouded Lore. The opponent chooses a card
//     in your graveyard as Shrouded Lore resolves. After that choice is made, you're given the
//     option to pay {B}. If you do, the targeted opponent must choose a different card, if there
//     is one. (If there isn't one, this part is skipped.) Then you're given the option to pay
//     {B} again. As long as you keep paying {B}, the process continues. As soon as you decline
//     to pay {B}, the last card that was chosen by the opponent is put into your hand.
//   [2007-02-01] The spell has no knowledge of cards chosen for other spells named Shrouded Lore.

export default defineCard({
  name: "Shrouded Lore",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent chooses a card in your graveyard. You may pay {B}. If you do, repeat this process except that opponent can't choose a card already chosen for Shrouded Lore. Then put the last chosen card into your hand.",
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
        mayAgain: { cost: "{B}", prompt: "Pay {B} to have them choose another card?" },
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
