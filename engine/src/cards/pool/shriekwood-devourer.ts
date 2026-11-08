import { defineCard } from "../define.js";

// Rulings:
//   [2024-09-20] Creatures that enter attacking were never declared as attackers, so Shriekwood
//     Devourer's last ability won't take them into account.
//   [2024-09-20] The value of X is calculated only once, as Shriekwood Devourer's last ability
//     resolves.

const ATTACK_TEXT =
  "Whenever you attack with one or more creatures, untap up to X lands, where X is the greatest power among those creatures.";

export default defineCard({
  name: "Shriekwood Devourer",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 7,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you" },
      targets: [],
      // "Those creatures": the declared attackers, read as it resolves — one
      // that has left as it last existed on the battlefield (rule 608.2h).
      effect: {
        kind: "choose-permanents",
        filter: { type: "land" },
        upTo: { aggregate: "max", of: "power", filter: {}, in: "trigger-batch" },
        then: { kind: "untap", target: 0 },
        prompt: "Untap up to X lands",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
