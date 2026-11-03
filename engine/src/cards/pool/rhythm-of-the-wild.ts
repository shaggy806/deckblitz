import { defineCard } from "../define.js";

// A creature entering under this has riot there, so it's asked as it's about
// to enter (rule 614.12); one with riot of its own is asked twice (702.136b).

const COUNTER_TEXT = "Creature spells you control can't be countered.";
const RIOT_TEXT = "Nontoken creatures you control have riot. (They enter with your choice of a +1/+1 counter or haste.)";

export default defineCard({
  name: "Rhythm of the Wild",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: `${COUNTER_TEXT}\n${RIOT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { cantBeCountered: true, filter: { type: "creature" } },
      text: COUNTER_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", token: false, controlledBy: "you" } },
      grantKeywords: ["riot"],
      text: RIOT_TEXT,
    },
  ],
});
