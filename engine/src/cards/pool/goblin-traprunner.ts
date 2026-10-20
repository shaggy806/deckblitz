import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// The three flips are a tree of `flip-coin`s (Yusri's
// shape) carrying the wins so far, so every coin is flipped first and the
// tokens for the flips won are created afterwards, together, as one
// `create-token` — "for each flip you win" after "flip three coins".
const TEXT =
  "Whenever this creature attacks, flip three coins. For each flip you win, create a 1/1 red Goblin creature token that's tapped and attacking.";

/** `left` more coins to flip, `won` flips won so far. */
const flips = (left: number, won: number): EffectSpec | undefined => {
  if (left === 0) {
    return won === 0
      ? undefined
      : { kind: "create-token", token: "Goblin Token", count: won, tapped: true, attacking: "choose" };
  }
  const onWin = flips(left - 1, won + 1);
  const onLoss = flips(left - 1, won);
  return {
    kind: "flip-coin",
    ...(onWin === undefined ? {} : { won: onWin }),
    ...(onLoss === undefined ? {} : { lost: onLoss }),
  };
};

export default defineCard({
  name: "Goblin Traprunner",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: flips(3, 0)!,
      resolve: null,
      text: TEXT,
    },
  ],
});
