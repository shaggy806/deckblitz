import { defineCard } from "../define.js";

// EDHREC rank 8571.
//
// Rulings:
//   [2008-05-01] The second ability can target any creature except the Grim Poppet whose ability
//     is being activated. It can target a different Grim Poppet. It can be activated multiple
//     times targeting the same creature.

export default defineCard({
  name: "Grim Poppet",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 4,
  toughness: 4,
  text: "This creature enters with three -1/-1 counters on it.\nRemove a -1/-1 counter from this creature: Put a -1/-1 counter on another target creature.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "-1/-1", count: 1 } },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "Remove a -1/-1 counter from this creature: Put a -1/-1 counter on another target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 3 } },
      text: "This creature enters with three -1/-1 counters on it.",
    },
  ],
});
