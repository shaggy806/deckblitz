import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 4642.
//
// Rulings:
//   [2024-09-20] If Reluctant Role Model dies at the same time as one or more other creatures with
//     counters on them, its last ability will trigger for each of those creatures.
//   [2024-09-20] Reluctant Role Model's last ability doesn't cause you to move counters from the
//     creature that died onto the target creature. Rather, you put the same number of each kind of
//     counter the creature that died had when it died onto the target creature. Other effects that
//     interact with putting counters onto that creature will interact with this effect
//     accordingly.
//   [2024-09-20] If the creature that died had -1/-1 counters on it when it died, Reluctant Role
//     Model's last ability will include those as well. This may result in the target creature also
//     dying.
//   [2024-09-20] Survival abilities (and other abilities that trigger at the beginning of your
//     second main phase) will trigger at the beginning of the second main phase you take in a
//     turn. They won't trigger during your third, fourth, or other additional main phases in a
//     single turn, if effects somehow cause you to have more than two main phases.
//   [2024-09-20] If a creature's survival ability triggers but the creature leaves the battlefield
//     before the ability resolves, use its tapped or untapped status as it last existed on the
//     battlefield to determine whether or not the ability will do anything.
//   [2024-09-20] If a creature with a survival ability isn't tapped when your second main phase
//     begins, the ability won't trigger at all. You won't be able to tap it during your second
//     main phase in time to have that ability trigger.
//   [2024-09-20] If a creature's survival ability triggers but that creature is untapped when the
//     ability begins to resolve, that ability won't do anything.
//   [2024-09-20] In some unusual cases, you may end up putting the appropriate counters on more
//     than one permanent. For example, if you control The Ozolith when Reluctant Role Model dies,
//     you'll put the appropriate number of each kind of counter onto both The Ozolith and the
//     target creature.

export default defineCard({
  name: "Reluctant Role Model",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 2,
  toughness: 2,
  text: "Survival — At the beginning of your second main phase, if this creature is tapped, put a flying, lifelink, or +1/+1 counter on it.\nWhenever this creature or another creature you control dies, if it had counters on it, put those counters on up to one target creature.",
  triggered: [
    {
      // The kind is chosen as it resolves.
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", mainPhase: 2 },
          { kind: "source", filter: { tapped: true } },
        ],
      },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Put a flying counter on it", effect: { kind: "add-counter", target: "source", counter: "flying", amount: 1 } },
          { text: "Put a lifelink counter on it", effect: { kind: "add-counter", target: "source", counter: "lifelink", amount: 1 } },
          { text: "Put a +1/+1 counter on it", effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } },
        ],
      },
      resolve: null,
      text: "Survival — At the beginning of your second main phase, if this creature is tapped, put a flying, lifelink, or +1/+1 counter on it.",
    },
    // Itself and every other creature you control (`thisOrAnother`), once
    // for each that died with counters (the rulings) — read as it died.
    // "Those counters" are each kind it had, put on rather than moved (rule
    // 122.8).
    ...thisOrAnother(
      {
        trigger: {
          on: "dies",
          who: "you-control",
          filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
        },
        targets: [{ kind: "optional", of: "creature" }],
        effect: { kind: "put-counters-of", of: "trigger-object", target: 0 },
        resolve: null,
        text: "Whenever this creature or another creature you control dies, if it had counters on it, put those counters on up to one target creature.",
      },
      { counters: { compare: { op: "gte", n: 1 } } },
    ),
  ],
});
