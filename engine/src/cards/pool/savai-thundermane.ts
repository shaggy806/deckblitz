import { defineCard } from "../define.js";

// EDHREC rank 22564.
//
// Rulings:
//   [2020-04-17] While resolving Savai Thundermane’s triggered ability, you can’t pay {2} more
//     than once to have it deal more damage or gain more life.
//   [2020-04-17] Some cards with cycling have an ability that triggers when you cycle them, and
//     some cards have an ability that triggers whenever you cycle any card. These triggered
//     abilities resolve before you draw from the cycling ability.
//   [2020-04-17] You can pay {2} even if Savai Thundermane leaves the battlefield before its
//     triggered ability resolves. The reflexive triggered ability will still trigger if you do.
//   [2020-04-17] If you pay {2} while Savai Thundermane’s triggered ability is resolving, the
//     reflexive triggered ability triggers and will resolve separately. This is different from
//     effects that say “If you do . . .” in that players may take actions after you’ve paid mana
//     but before damage is dealt.
//   [2020-04-17] If the target creature is an illegal target by the time Savai Thundermane’s
//     reflexive triggered ability tries to resolve, the ability won’t resolve. You won’t gain 2
//     life.
//   [2020-04-17] You can cycle a card even if it has a triggered ability from cycling that won’t
//     have a legal target. This is because the cycling ability and the triggered ability are
//     separate. This also means that if either ability is countered (with Disallow, for example),
//     the other ability will still resolve.
//   [2020-04-17] Triggered abilities from cycling a card and the cycling ability itself aren’t
//     spells. Effects that interact with spells (such as that of Cancel) won’t affect them.

export default defineCard({
  name: "Savai Thundermane",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Cat"],
  power: 3,
  toughness: 2,
  text: "Whenever you cycle a card, you may pay {2}. When you do, this creature deals 2 damage to target creature and you gain 2 life.",
  triggered: [
    {
      trigger: { on: "cycles", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "damage", amount: 2, target: 0 },
              { kind: "gain-life", amount: 2 },
            ],
          },
          text: "When you do, this creature deals 2 damage to target creature and you gain 2 life.",
        },
      },
      resolve: null,
      text: "Whenever you cycle a card, you may pay {2}. When you do, this creature deals 2 damage to target creature and you gain 2 life.",
    },
  ],
});
