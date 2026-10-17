import { defineCard } from "../define.js";

// EDHREC rank 14066.
//
// Rulings:
//   [2023-10-13] If The Moment leaves the battlefield before its first activated ability resolves,
//     the target creature will be untapped, but won't phase out.
//   [2023-10-13] A creature phased out by The Moment doesn't phase in during its controller's
//     untap step as normal. Rather, it phases in immediately after The Moment leaves the
//     battlefield.
//   [2023-10-13] The Moment's last ability will destroy itself before you can sacrifice it if
//     there are two or more time counters on it as its last ability resolves. Effects that trigger
//     when you sacrifice a permanent will not trigger when it is destroyed this way.
//
// The phasing is Oubliette's `untilSourceLeaves`, which phases nothing out
// once the source has left (rule 610.4b — the first ruling). The wipe counts
// the time counters as it resolves (a departed source's last known count), and
// `sacrifice-source` does nothing once the wipe has destroyed The Moment.
const UPKEEP_TEXT = "At the beginning of your upkeep, put a time counter on The Moment.";
const PHASE_TEXT = "{2}, {T}: Untap target creature you control. It phases out until The Moment leaves the battlefield.";
const WIPE_TEXT =
  "{3}, {T}: Destroy each nonland permanent with mana value less than or equal to the number of time counters on The Moment. Then sacrifice The Moment. Activate only as a sorcery.";

export default defineCard({
  name: "The Moment",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${UPKEEP_TEXT}\n${PHASE_TEXT}\n${WIPE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "phase-out", target: 0, untilSourceLeaves: true },
        ],
      },
      resolve: null,
      text: PHASE_TEXT,
    },
    {
      cost: { mana: "{3}", tap: true },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "destroy-all",
            filter: {
              notTypes: ["land"],
              manaValue: { op: "lte", n: { amount: { countersOn: "source", counter: "time" } } },
            },
          },
          { kind: "sacrifice-source" },
        ],
      },
      resolve: null,
      text: WIPE_TEXT,
    },
  ],
});
