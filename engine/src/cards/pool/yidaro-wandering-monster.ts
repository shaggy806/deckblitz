import { defineCard } from "../define.js";

// Ikoria: Lair of Behemoths (IKO). "When you cycle this card" goes on
// the stack above the cycling draw and resolves first (the ruling). The count
// is every card named Yidaro, Wandering Monster you've cycled this game, this
// one included (the journal's `cycledNames`, the `cycled-this-game`
// condition): any physical card counts (the ruling). With the card gone from
// your graveyard by then, neither move happens, though you still shuffle your
// library if it wasn't the fourth time (the ruling; rule 701.24c).
//
// Rulings:
//   You don't have to cycle the same physical card four times for Yidaro to get tired of being
//     cycled and stomp onto the battlefield. Any cards named Yidaro, Wandering Monster will count.
//   If you cycle Yidaro but it isn't in your graveyard as the triggered ability resolves, you can't
//     put it onto the battlefield or shuffle it into your library. You'll still shuffle your
//     library if you haven't cycled Yidaro four times this game.

const CYCLED =
  "When you cycle this card, shuffle it into your library from your graveyard. If you've cycled a card named Yidaro, Wandering Monster four or more times this game, put it onto the battlefield from your graveyard instead.";

export default defineCard({
  name: "Yidaro, Wandering Monster",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Turtle"],
  power: 8,
  toughness: 8,
  keywords: ["trample", "haste"],
  cycling: { cost: "{1}{R}" },
  text: `Trample, haste\nCycling {1}{R} ({1}{R}, Discard this card: Draw a card.)\n${CYCLED}`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "cycled-this-game", named: "Yidaro, Wandering Monster", atLeast: 4 },
        then: { kind: "put-onto-battlefield", target: "source" },
        else: { kind: "shuffle-into-library", target: "source" },
      },
      resolve: null,
      text: CYCLED,
    },
  ],
});
