import { defineCard } from "../define.js";

// EDHREC rank 23685.
//
// Rulings:
//   [2022-02-18] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//   [2022-02-18] An Aura controlled by an opponent does not cause a creature you control to be
//     modified.
//   [2022-02-18] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.
//
// Cackling Slasher's gated enters-with replacement, checked as it enters
// (rule 614.1c) — before it's on the battlefield, so it never sees itself.
const ENTER_TEXT = "This creature enters with a +1/+1 counter on it if you control a modified creature.";

export default defineCard({
  name: "Heir of the Ancient Fang",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Samurai"],
  power: 2,
  toughness: 3,
  text: `${ENTER_TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "controls", filter: { type: "creature", modified: true }, atLeast: 1 },
            then: 1,
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
});
