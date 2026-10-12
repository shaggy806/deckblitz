import { defineCard } from "../define.js";
import { saddle, saddleText } from "../helpers.js";

// Put into your hand, not drawn (Dark Confidant's shape). Whether it's
// saddled is asked as the ability resolves — as it last was on the
// battlefield if it has left by then (the ruling).
const ATTACK_TEXT =
  "Whenever this creature attacks, reveal the top card of your library and put it into your hand. You lose life equal to that card's mana value if this creature isn't saddled. Otherwise, each opponent loses that much life.";

export default defineCard({
  name: "Caustic Bronco",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Snake", "Horse", "Mount"],
  power: 2,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${saddleText(3)}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        reveal: true,
        then: {
          kind: "conditional",
          condition: { kind: "source", filter: { saddled: true } },
          then: { kind: "lose-life", who: "each-opponent", amount: { manaValueOf: 0 } },
          else: { kind: "lose-life", who: "you", amount: { manaValueOf: 0 } },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(3, saddleText(3))],
});
