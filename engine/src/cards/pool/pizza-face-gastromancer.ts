import { defineCard } from "../define.js";
import { REVOLT_CONDITION } from "../helpers.js";

// EDHREC rank 15749.
// Makes Food → use "Food Token".
//
// Rulings:
//   [2026-01-27] If the target permanent is an attached Equipment, it becomes unattached. If an
//     Equipment without reconfigure becomes an artifact creature, it can't be attached to another
//     creature.
//   [2026-01-27] Some spells and abilities that create Food tokens may require targets. If each
//     target chosen is an illegal target as that spell or ability tries to resolve, it won't
//     resolve. You won't create any Food tokens.
//   [2026-01-27] The target permanent retains any types, subtypes, or supertypes it has.
//   [2026-01-27] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token. For example, you can sacrifice Pizza Face (a Legendary Artifact Creature —
//     Food Mutant) to activate Maraleaf Rider's ability (an ability with "Sacrifice a Food" in its
//     cost). You can't sacrifice a Food to pay multiple costs. For example, you can't sacrifice a
//     Food token to activate its own ability and also to activate Maraleaf Rider's ability.
//   [2026-01-27] If the target permanent has station, its base power and toughness will be set to
//     0/0. Adding charge counters to that permanent won't restore the power and toughness printed
//     in any of its striations.
//   [2026-01-27] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.
//   [2026-01-27] Whatever you do, don't eat the cards. (Also, don't make the pizzas pictured on
//     the cards. You don't have the digestive system of a Ninja Turtle.)
//   [2026-01-27] If the target permanent is a Vehicle, its base power and toughness will be set to
//     0/0. Crewing that Vehicle will not restore its power and toughness.
//   [2026-01-27] Pizza Face's second ability doesn't remove any abilities the target permanent
//     has.
//   [2026-01-27] The resulting creature will be able to attack on your turn if it's been under
//     your control continuously since the turn began. That is, it doesn't matter how long it's
//     been a creature, just how long it's been on the battlefield.
//   [2026-01-27] Some disappear abilities, such as those of the above cards, are triggered
//     abilities with intervening if clauses. If a permanent hasn't left the battlefield under your
//     control that turn by the time the disappear ability would trigger, it won't trigger at all.
// "If it isn't a creature" is read once the counters are on it: it becomes a
// 0/0 Mutant creature (base P/T set in layer 7b, so the counters make it
// 3/3), keeping its other types, subtypes and abilities, for as long as it
// stays on the battlefield.

const FOOD_TEXT = "When Pizza Face enters, create a Food token.";
const DISAPPEAR_TEXT =
  "Disappear — At the beginning of your end step, if a permanent left the battlefield under your control this turn, put three +1/+1 counters on up to one other target artifact or creature. If it isn't a creature, it becomes a 0/0 Mutant creature in addition to its other types.";
const LIFE_TEXT = "{10}, {T}, Sacrifice Pizza Face: You gain 15 life.";

export default defineCard({
  name: "Pizza Face, Gastromancer",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Food", "Mutant"],
  power: 2,
  toughness: 4,
  text: `${FOOD_TEXT}\n${DISAPPEAR_TEXT}\n${LIFE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: FOOD_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } } },
        },
      ],
      condition: REVOLT_CONDITION,
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { notTypes: ["creature"] } },
            then: {
              kind: "animate",
              target: 0,
              power: 0,
              toughness: 0,
              addTypes: ["creature"],
              addSubtypes: ["Mutant"],
              duration: "permanent",
            },
          },
        ],
      },
      resolve: null,
      text: DISAPPEAR_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{10}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 15 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
