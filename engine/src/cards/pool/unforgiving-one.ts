import { defineCard } from "../define.js";

// Rulings:
//   [2022-02-18] The value of X needs to be determined both when the ability triggers (so you can
//     choose a target) and again when the ability resolves (to check if that target is still
//     legal). If the number of modified creatures you control has decreased enough in that time
//     to make the target illegal, Unforgiving One's ability won't resolve.
//   [2022-02-18] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it; a counter of any kind counts; an Aura controlled by an
//     opponent doesn't (the `modified` filter, rule 700.9).

const ATTACK_TEXT =
  "Whenever this creature attacks, return target creature card with mana value X or less from your graveyard to the battlefield, where X is the number of modified creatures you control.";

export default defineCard({
  name: "Unforgiving One",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${ATTACK_TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      // The target filter's X is read live — as the target is chosen and
      // again as the ability resolves (the ruling).
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            type: "creature",
            manaValue: {
              op: "lte",
              n: { amount: { countOf: { type: "creature", controlledBy: "you", modified: true } } },
            },
          },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
