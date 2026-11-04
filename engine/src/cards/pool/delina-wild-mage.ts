import { defineCard } from "../define.js";

import type { EffectSpec } from "../../effects.js";

// EDHREC rank 1741.
//
// Rulings:
//   You declare which player or planeswalker the token is attacking as you put it onto the
//     battlefield. It doesn't have to be the same player or planeswalker Delina is attacking.
//   Although the token is attacking, it was never declared as an attacking creature.
//   Delina has received an update to its Oracle text: rolling again on a result of 15-20 is
//     optional.
//
// The target is chosen as the ability goes on the stack, once; every roll of the resolution reads
// the same one. The token has the exile ability (Heat Shimmer's shape, `exceptions.triggered`), so a
// copy of it has it too (rule 707.9b), unlike `exileAtEndOfCombat`'s delayed trigger.
const TOKEN: EffectSpec = {
  kind: "create-token-copy",
  of: 0,
  count: 1,
  who: "you",
  tapped: true,
  attacking: "choose",
  notLegendary: true,
  exceptions: {
    triggered: [
      {
        trigger: { on: "step-begins", step: "end-combat", who: "any" },
        targets: [],
        effect: { kind: "exile", target: "source" },
        resolve: null,
        text: "At end of combat, exile this token.",
      },
    ],
  },
};

const TEXT =
  "Whenever Delina attacks, choose target creature you control, then roll a d20.\n" +
  '1—14 | Create a tapped and attacking token that\'s a copy of that creature, except it\'s not legendary and it has "At end of combat, exile this token."\n' +
  "15—20 | Create one of those tokens. You may roll again.";

export default defineCard({
  name: "Delina, Wild Mage",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 14, effect: TOKEN },
          { min: 15, max: 20, effect: TOKEN, mayRollAgain: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
