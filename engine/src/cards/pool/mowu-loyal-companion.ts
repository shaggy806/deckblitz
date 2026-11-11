import { defineCard } from "../define.js";

// EDHREC rank 8361. Hardened Scales on Mowu alone: the filter keeps it to
// Mowu itself, the counters it enters with included (the ruling).
const SCALES_TEXT =
  "If one or more +1/+1 counters would be put on Mowu, that many plus one +1/+1 counters are put on it instead.";

export default defineCard({
  name: "Mowu, Loyal Companion",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${SCALES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-add-counter",
        instead: { modify: { plus: 1 } },
        counterKind: "+1/+1",
        filter: { isSource: true },
      },
      text: SCALES_TEXT,
    },
  ],
});
