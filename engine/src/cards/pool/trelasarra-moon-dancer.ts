import { defineCard } from "../define.js";

// EDHREC rank 6798.
//
// Rulings:
//   [2021-07-23] Each creature with lifelink dealing combat damage causes a separate life gain
//     event. For example, if two creatures you control with lifelink deal combat damage at the
//     same time, a "whenever you gain life" ability will trigger twice. However, if a single
//     creature you control with lifelink deals combat damage to multiple creatures, players,
//     and/or planeswalkers at the same time (perhaps because it has trample or was blocked by more
//     than one creature), the ability will trigger only once.
//   [2021-07-23] An ability that triggers "whenever you gain life" triggers just once for each
//     life gain event, no matter how much life you gain.
//   [2021-07-23] If you gain life at the same time Trelasarra, Moon Dancer is dealt lethal damage,
//     it dies before its triggered ability can put a +1/+1 counter on it, but you will still scry
//     1.

export default defineCard({
  name: "Trelasarra, Moon Dancer",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric"],
  power: 2,
  toughness: 2,
  text: "Whenever you gain life, put a +1/+1 counter on Trelasarra and scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever you gain life, put a +1/+1 counter on Trelasarra and scry 1.",
    },
  ],
});
