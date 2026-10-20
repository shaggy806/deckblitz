import { defineCard } from "../define.js";

// Rulings, as `preventsCounters` runs them: no counters already there are
// removed; a cost that puts counters on one of these permanents can't be paid;
// one enters without the counters it would have — unless it enters along with
// Solemnity; a suspended card in exile still gets its time counters (not a
// permanent); infect and wither damage leave nothing on a creature and give a
// player no poison, though it's still dealt (lifelink); energy is a counter too.
const PLAYERS_TEXT = "Players can't get counters.";
const PERMANENTS_TEXT = "Counters can't be put on artifacts, creatures, enchantments, or lands.";

export default defineCard({
  name: "Solemnity",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${PLAYERS_TEXT}\n${PERMANENTS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      preventsCounters: { players: "each" },
      text: PLAYERS_TEXT,
    },
    {
      affects: { scope: "self" },
      preventsCounters: { permanents: { typesAnyOf: ["artifact", "creature", "enchantment", "land"] } },
      text: PERMANENTS_TEXT,
    },
  ],
});
