import { defineCard } from "../define.js";

// EDHREC rank 17336. "Except by creatures with flying or reach": creatures
// with neither can't block it — the second `notKeyword` rides in a one-member
// `anyOf` (Sidar Kondo of Jamuraa).

const TEXT = "This creature can't be blocked except by creatures with flying or reach.";

export default defineCard({
  name: "Spire Tracer",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { notKeyword: "flying", anyOf: [{ notKeyword: "reach" }] },
      text: TEXT,
    },
  ],
});
