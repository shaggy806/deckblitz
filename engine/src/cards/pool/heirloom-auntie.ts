import { defineCard } from "../define.js";

// EDHREC rank 15312.
//
// Rulings:
//   [2025-11-17] If Heirloom Auntie dies at the same time as one or more other creatures you
//     control, its last ability will trigger for each of those other creatures.

// A leaves-the-battlefield trigger looks back (rule 603.10a), so if the
// Auntie dies with other creatures it triggers for each of them (the ruling);
// the counter removal then does nothing.
const ENTERS_TEXT = "This creature enters with two -1/-1 counters on it.";
const DIES_TEXT = "Whenever another creature you control dies, surveil 1, then remove a -1/-1 counter from this creature.";

export default defineCard({
  name: "Heirloom Auntie",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Warlock"],
  power: 4,
  toughness: 4,
  text: `${ENTERS_TEXT}\n${DIES_TEXT} (To surveil 1, look at the top card of your library. You may put it into your graveyard.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 2 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "surveil", amount: 1 },
          { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
