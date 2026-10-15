import { defineCard } from "../define.js";

// EDHREC rank 8448. Final Fantasy.
//
// Rulings:
//   [2025-06-06] You don't choose a target for Yuna's Whistle at the time you cast it. Rather, a
//     second "reflexive" ability triggers when you reveal a creature card this way. You choose a
//     target for that ability as it goes on the stack. Each player may respond to this triggered
//     ability as normal.
//   [2025-06-06] If the revealed card has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//
// Evolutionary Leap's reveal, whose `then` (the card found as its target 0,
// skipped when nothing was found) triggers the reflexive ability, X read off
// the found card as it triggers — so players respond knowing it.
const TEXT =
  "Reveal cards from the top of your library until you reveal a creature card. Put that card into your hand and the rest on the bottom of your library in a random order. When you reveal a creature card this way, put X +1/+1 counters on target creature you control, where X is the mana value of that card.";

export default defineCard({
  name: "Yuna's Whistle",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "reveal-until",
    filter: { type: "creature" },
    put: "hand",
    rest: "bottom-random",
    then: {
      kind: "reflexive-trigger",
      targets: ["creature-you-control"],
      value: { manaValueOf: 0 },
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { triggerValue: true } },
      text: "When you reveal a creature card this way, put X +1/+1 counters on target creature you control, where X is the mana value of that card.",
    },
  },
});
