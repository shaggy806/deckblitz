import { defineCard } from "../define.js";
import { persist } from "../helpers.js";

// Wingrattle Scarecrow's shape: persist granted by a conditional static, read
// as the Scarecrow last existed (rule 603.10a), so a black creature dying
// alongside it still counts.
const PERSIST_TEXT =
  "This creature has persist as long as you control a black creature. (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)";
const HASTE_TEXT = "This creature has haste as long as you control a red creature.";

export default defineCard({
  name: "Rattleblaze Scarecrow",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 5,
  toughness: 3,
  text: `${PERSIST_TEXT}\n${HASTE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["B"] }, atLeast: 1, countsSelf: true },
      grantsTriggered: [persist()],
      text: PERSIST_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["R"] }, atLeast: 1, countsSelf: true },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
});
