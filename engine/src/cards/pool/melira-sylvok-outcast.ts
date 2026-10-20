import { defineCard } from "../define.js";

// None of it removes counters already there (the ruling). Infect damage to
// you or your creatures is still dealt (lifelink sees it) but gives no poison
// or -1/-1 counters; an opponent's creature that gains infect later keeps it
// in timestamp order (layer 6), and one entering later loses it.
const POISON_TEXT = "You can't get poison counters.";
const COUNTERS_TEXT = "Creatures you control can't have -1/-1 counters put on them.";
const INFECT_TEXT = "Creatures your opponents control lose infect.";

export default defineCard({
  name: "Melira, Sylvok Outcast",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 2,
  text: `${POISON_TEXT}\n${COUNTERS_TEXT}\n${INFECT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      preventsCounters: { players: "you", kind: "poison" },
      text: POISON_TEXT,
    },
    {
      affects: { scope: "self" },
      preventsCounters: { permanents: { type: "creature", controlledBy: "you" }, kind: "-1/-1" },
      text: COUNTERS_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      loseKeywords: ["infect"],
      text: INFECT_TEXT,
    },
  ],
});
