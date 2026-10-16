import { defineCard } from "../define.js";
import { GIFT_KICKER } from "../helpers.js";

// EDHREC rank 13794. Sazacap's Brew's shape: promised, the gift comes first,
// then the draw, then the tap and stun counter on the extra target the
// promise adds (the rulings: an unpromised cast has no second target; an
// already-tapped creature still gets the counter).
export default defineCard({
  name: "Mind Spiral",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text:
    "Gift a tapped Fish (You may promise an opponent a gift as you cast this spell. If you do, they create a tapped 1/1 blue Fish creature token before its other effects.)\n" +
    "Target player draws three cards. If the gift was promised, tap target creature an opponent controls and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  targets: ["player"],
  effect: { kind: "draw", amount: 3, target: 0 },
  kicker: {
    ...GIFT_KICKER,
    targets: ["player", "creature-an-opponent-controls"],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "gift", gift: "tapped-fish" },
        { kind: "draw", amount: 3, target: 0 },
        { kind: "tap", target: 1 },
        { kind: "add-counter", target: 1, counter: "stun", amount: 1 },
      ],
    },
  },
});
