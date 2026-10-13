import { defineCard } from "../define.js";

// EDHREC rank 7026.
//
// Rulings:
//   [2016-08-23] Abilities that trigger whenever you "become the monarch" trigger only if you
//     aren't already the monarch. For example, if you are already the monarch as Custodi Lich
//     enters the battlefield, its last ability won't trigger.
//   [2016-08-23] Being the monarch carries two inherent triggered abilities. "At the beginning of
//     the monarch's end step, that player draws a card" and "Whenever a creature deals combat
//     damage to the monarch, its controller becomes the monarch."
//   [2016-08-23] If the triggered ability that causes the monarch to draw a card goes on the
//     stack, and a different player becomes the monarch before that ability resolves, the first
//     player will still draw the card.
//   [2016-08-23] The game starts with no monarch. Once an effect makes one player the monarch, the
//     game will have exactly one monarch from that point forward.

const ATTACKED =
  "Whenever a creature attacks you or a planeswalker you control, that creature's controller loses 1 life.";

export default defineCard({
  name: "Marchesa's Decree",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `When this enchantment enters, you become the monarch.\n${ATTACKED}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: "When this enchantment enters, you become the monarch.",
    },
    // Revenge of Ravens' trigger, without its life gain.
    {
      trigger: { on: "attacks", who: "any", attackingYou: true },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: ATTACKED,
    },
  ],
});
