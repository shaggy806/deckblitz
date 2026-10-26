import { defineCard } from "../define.js";

// EDHREC rank 29733. Magmaroth's counter removal, once per colour trigger.
//
// Rulings:
//   [2008-08-01] If you cast a spell that's both of the listed colors, both abilities will
//     trigger. You'll remove a total of two -1/-1 counters from the Hatchling.
//   [2008-08-01] If there are no -1/-1 counters on it when the triggered ability resolves, the
//     ability does nothing.

const ENTERS_TEXT = "This creature enters with four -1/-1 counters on it.";
const WHITE_TEXT = "Whenever you cast a white spell, remove a -1/-1 counter from this creature.";
const BLACK_TEXT = "Whenever you cast a black spell, remove a -1/-1 counter from this creature.";

export default defineCard({
  name: "Voracious Hatchling",
  manaCost: "{3}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  keywords: ["lifelink"],
  text: `Lifelink\n${ENTERS_TEXT}\n${WHITE_TEXT}\n${BLACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 4 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["W"] } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: WHITE_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["B"] } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: BLACK_TEXT,
    },
  ],
});
