import { defineCard } from "../define.js";

// EDHREC rank 21481.
//
// Rulings:
//   [2025-11-17] The effect of Retched Wretch's last ability that causes it to lose all abilities
//     lasts indefinitely. It doesn't expire during the cleanup step.
//
// "If it had a -1/-1 counter on it" is an intervening if read off the
// creature as it last existed (rule 603.10a — `self-counters`, as persist's
// is). It returns under its owner's control, and "loses all abilities" has no
// duration, so it lasts as long as the returned permanent stays (rule 611.2a
// — Hellcat, Undying Vigilante's shape): dying again, it doesn't come back.
const TEXT =
  "When this creature dies, if it had a -1/-1 counter on it, return it to the battlefield under its owner's control and it loses all abilities.";

export default defineCard({
  name: "Retched Wretch",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "-1/-1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "trigger-object" },
          { kind: "lose-abilities", target: "trigger-object", duration: "permanent" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
