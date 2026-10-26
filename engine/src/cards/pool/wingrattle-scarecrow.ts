import { defineCard } from "../define.js";
import { persist } from "../helpers.js";

// EDHREC rank 11399.
//
// Persist is granted by a conditional static, so it's on the Scarecrow only
// while you control a black creature; the dies trigger reads the Scarecrow as
// it last existed (rule 603.10a), so a black creature dying alongside it still
// counts.
const FLYING_TEXT = "This creature has flying as long as you control a blue creature.";
const PERSIST_TEXT =
  "This creature has persist as long as you control a black creature. (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)";

export default defineCard({
  name: "Wingrattle Scarecrow",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 2,
  text: `${FLYING_TEXT}\n${PERSIST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["U"] }, atLeast: 1, countsSelf: true },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["B"] }, atLeast: 1, countsSelf: true },
      grantsTriggered: [persist()],
      text: PERSIST_TEXT,
    },
  ],
});
