import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";

// The Brothers' War (BRO). EDHREC rank 6826.
//
// A meld card (rule 712.4): it and Phyrexian Dragon Engine meld into Mishra,
// Lost to Phyrexia. The "if" is checked as the trigger resolves: this
// creature must still be attacking (the `conditional` on the source), and you must own
// and control it and an attacking creature of that name (the `meld` effect's
// own check, with `attacking` on the partner). The melded permanent enters
// tapped and attacking (rule 508.4): its "enters" ability triggers, its
// "attacks" doesn't.
//
// X is counted as the trigger resolves, every attacking creature whoever
// controls it — once, for the loss and the gain alike.
//
// Rulings:
//   [2022-10-14] Mishra, Lost to Phyrexia enters the battlefield tapped and attacking, but since
//     it wasn't declared as an attacker, no abilities that trigger when a creature attacks will
//     trigger.
//   [2022-10-14] You choose which player or planeswalker Mishra, Lost to Phyrexia is attacking as
//     it enters the battlefield.
//   [2022-10-14] One card in each pair of meld cards has an ability that instructs you to exile
//     the two cards and meld them. If you control more than one object with one of those names,
//     you select one object with that name to exile.
const TEXT =
  "Whenever you attack, each opponent loses X life and you gain X life, where X is the number of attacking creatures. If Mishra, Claimed by Gix and a creature named Phyrexian Dragon Engine are attacking, and you both own and control them, exile them, then meld them into Mishra, Lost to Phyrexia. It enters tapped and attacking.";

const ATTACKERS: EffectAmount = { countOf: { type: "creature", attacking: true } };

export default defineCard({
  name: "Mishra, Claimed by Gix",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Artificer"],
  meldCard: true,
  power: 3,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: ATTACKERS, who: "each-opponent" },
          { kind: "gain-life", amount: ATTACKERS },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { attacking: true } },
            then: {
              kind: "meld",
              partner: { name: "Phyrexian Dragon Engine", type: "creature", attacking: true },
              into: "Mishra, Lost to Phyrexia",
              tapped: true,
              attacking: "choose",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
