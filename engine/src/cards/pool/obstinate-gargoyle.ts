import { defineCard } from "../define.js";
import { persist } from "../helpers.js";

// EDHREC rank 14399.
//
// Rulings:
//   [2024-06-07] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.
//   [2024-06-07] An Aura controlled by another player does not cause a creature you control to be
//     modified.
//   [2024-06-07] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//   [2024-06-07] If a creature with persist that has +1/+1 counters on it receives enough -1/-1
//     counters to cause it to be destroyed by lethal damage or put into its owner's graveyard for
//     having 0 or less toughness, persist won't trigger and the card won't return to the
//     battlefield.
//
// Skyward Spider's `modified` static (rule 700.9). Returned by persist, the
// -1/-1 counter makes it modified, so it flies.
const FLY_TEXT =
  "This creature has flying as long as it's modified. (Equipment, Auras you control, and counters are modifications.)";

export default defineCard({
  name: "Obstinate Gargoyle",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 2,
  toughness: 2,
  text: `${FLY_TEXT}\nPersist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { modified: true } },
      grantKeywords: ["flying"],
      text: FLY_TEXT,
    },
  ],
  triggered: [persist()],
});
