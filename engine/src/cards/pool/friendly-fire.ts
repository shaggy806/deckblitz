import { defineCard } from "../define.js";

// EDHREC rank 27774. The revealed card sits beside the target in slot 1; its mana
// value goes to both at once.

export default defineCard({
  name: "Friendly Fire",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature's controller reveals a card at random from their hand. Friendly Fire deals damage to that creature and that player equal to the revealed card's mana value.",
  targets: ["creature"],
  effect: {
    kind: "choose-random-card",
    zone: "hand",
    whose: { controllerOfTarget: 0 },
    show: "reveal",
    slot: 1,
    then: {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: { manaValueOf: 1 }, target: 0 },
        { kind: "damage", amount: { manaValueOf: 1 }, toControllerOfTarget: 0 },
      ],
    },
  },
});
