import { defineCard } from "../define.js";

// EDHREC rank 20311.
//
// Rulings:
//   [2008-08-01] If there are no -1/-1 counters on it when the triggered ability resolves, the
//     ability does nothing.
//   [2008-08-01] If you cast a spell that's both of the listed colors, both abilities will
//     trigger. You'll remove a total of two -1/-1 counters from the Hatchling.

const ENTERS_TEXT = "This creature enters with four -1/-1 counters on it.";
const WITHER_TEXT = "Wither (This deals damage to creatures in the form of -1/-1 counters.)";
const BLACK_TEXT = "Whenever you cast a black spell, remove a -1/-1 counter from this creature.";
const GREEN_TEXT = "Whenever you cast a green spell, remove a -1/-1 counter from this creature.";

export default defineCard({
  name: "Noxious Hatchling",
  manaCost: "{3}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  keywords: ["wither"],
  text: `${ENTERS_TEXT}\n${WITHER_TEXT}\n${BLACK_TEXT}\n${GREEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 4 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["B"] } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: BLACK_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["G"] } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: GREEN_TEXT,
    },
  ],
});
