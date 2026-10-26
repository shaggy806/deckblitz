import { defineCard } from "../define.js";

// EDHREC rank 28727.
//
// Rulings:
//   [2008-08-01] If you cast a spell that's both of the listed colors, both abilities will
//     trigger. You'll remove a total of two -1/-1 counters from the Hatchling.
//   [2008-08-01] If there are no -1/-1 counters on it when the triggered ability resolves, the
//     ability does nothing.

const ENTERS_TEXT = "This creature enters with four -1/-1 counters on it.";
const RED_TEXT = "Whenever you cast a red spell, remove a -1/-1 counter from this creature.";
const WHITE_TEXT = "Whenever you cast a white spell, remove a -1/-1 counter from this creature.";

export default defineCard({
  name: "Belligerent Hatchling",
  manaCost: "{3}{R/W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  keywords: ["first-strike"],
  text: `First strike\n${ENTERS_TEXT}\n${RED_TEXT}\n${WHITE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 4 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: RED_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["W"] } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: WHITE_TEXT,
    },
  ],
});
