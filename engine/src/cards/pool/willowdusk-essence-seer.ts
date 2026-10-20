import { defineCard } from "../define.js";

// EDHREC rank 10610. Commander 2021.
//
// "Whichever is greater" of the life you gained and the life you lost this
// turn is max(gained, lost) = lost + (gained − lost, never below 0): a
// `difference` clamps at 0 (rule 107.1b), so the `sum` is exactly the
// greater of the two. Both are read as the ability resolves.
const TEXT =
  "{1}, {T}: Choose another target creature. Put a number of +1/+1 counters on it equal to the amount of life you gained this turn or the amount of life you lost this turn, whichever is greater. Activate only as a sorcery.";

export default defineCard({
  name: "Willowdusk, Essence Seer",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dryad", "Druid"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      sorcerySpeed: true,
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "add-counter",
        target: 0,
        counter: "+1/+1",
        amount: {
          sum: [
            { turnStat: "life-lost", who: "you" },
            {
              difference: [
                { turnStat: "life-gained", who: "you" },
                { turnStat: "life-lost", who: "you" },
              ],
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
