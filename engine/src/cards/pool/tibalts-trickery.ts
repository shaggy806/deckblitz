import { defineCard } from "../define.js";

// EDHREC rank 599.
// Rulings:
//   [2021-02-05] If the spell has {X} in its mana cost, they must choose 0 as the value of X.
//   [2021-02-05] If there aren't any nonland cards in that library with a different name than the
//     countered spell, the player will exile all cards from their library, revealing all of them,
//     and then they'll put those cards on the bottom of their library in a random order.
//   [2021-02-05] Tibalt's Trickery can target a spell that can't be countered. If Tibalt's Trickery
//     resolves, the target spell won't be countered, but all of the other effects will still happen.
//
// "That spell" is read as it last was on the stack (rule 608.2h): its controller
// (`lastStackController`, its owner's graveyard is no guide) and its name, which
// for a modal double-faced card's back face isn't the card's in the graveyard
// (the ruling). The card found is `then`'s slot 0, the spell slot 1.
export default defineCard({
  name: "Tibalt's Trickery",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Counter target spell. Choose 1, 2, or 3 at random. Its controller mills that many cards, then exiles cards from the top of their library until they exile a nonland card with a different name than that spell. They may cast that card without paying its mana cost. Then they put the exiled cards on the bottom of their library in a random order.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "modal",
        random: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "1", effect: { kind: "mill", target: 0, amount: 1 } },
          { text: "2", effect: { kind: "mill", target: 0, amount: 2 } },
          { text: "3", effect: { kind: "mill", target: 0, amount: 3 } },
        ],
      },
      {
        kind: "reveal-until",
        whose: { controllerOfTarget: 0 },
        filter: { notTypes: ["land"], not: { sameNameAsTarget: 0 } },
        exile: true,
        thenKeepsTargets: true,
        then: { kind: "cast-now", target: 0, free: true, by: { controllerOfTarget: 1 } },
        rest: "bottom-random",
      },
    ],
  },
});
