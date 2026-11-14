import { defineCard } from "../define.js";

// EDHREC rank 9750.
//
// Rulings:
//   If Slumbering Trudge enters the battlefield without being cast, X is 0. The same is true if an
//   effect lets you cast Slumbering Trudge without paying its mana cost.
//
// One entering replacement (rule 614.1c): the stun counters are three minus the X it was cast
// with (rule 107.3m; none once X is 3 or more), and it enters tapped unless X is 3 or more
// (`tappedUnless` an `x` condition, read with that X).

const TEXT =
  "This creature enters with a number of stun counters on it equal to three minus X. If X is 2 or less, it enters tapped. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "Slumbering Trudge",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Beast"],
  power: 6,
  toughness: 6,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "stun", amount: { difference: [3, "x"] } },
        tappedUnless: { kind: "x", compare: { op: "gte", n: 3 } },
      },
      text: TEXT,
    },
  ],
});
