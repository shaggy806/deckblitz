import { defineCard } from "../define.js";

// EDHREC rank 28461. A static's `controls` already leaves this permanent out
// ("another"); a second Warden counts (the ruling).

const TEXT = "This creature can't attack unless you control another creature with power 4 or greater.";

export default defineCard({
  name: "Warden of the Chained",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      },
      restrictions: ["cant-attack"],
      text: TEXT,
    },
  ],
});
