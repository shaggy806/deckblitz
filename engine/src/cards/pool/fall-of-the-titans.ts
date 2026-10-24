import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 10911.
//
// Surge {X}{R} is an alternative cost with its own {X} (one X, where the mana
// cost has two); the mana value stays that of {X}{X}{R} (the rulings). The
// two targets are distinct ("each of up to two targets") and dealt damage
// as one event.
export default defineCard({
  name: "Fall of the Titans",
  manaCost: "{X}{X}{R}",
  colors: ["R"],
  types: ["instant"],
  alternativeCost: {
    mana: "{X}{R}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: "Surge {X}{R} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)\nFall of the Titans deals X damage to each of up to two targets.",
  targets: distinctTargets(2, "any-target", { optional: true }),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "damage", amount: "x", target: 1 },
    ],
  },
});
