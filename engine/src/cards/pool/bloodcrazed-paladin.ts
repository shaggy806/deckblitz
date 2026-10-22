import { defineCard } from "../define.js";

// EDHREC rank 14176. Ixalan. Grizzly Ghoul's counters: every
// creature that died this turn, whoever controlled it (the ruling).
const TEXT = "This creature enters with a +1/+1 counter on it for each creature that died this turn.";

export default defineCard({
  name: "Bloodcrazed Paladin",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 1,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { creaturesDiedThisTurn: true, anyController: true } },
      },
      text: TEXT,
    },
  ],
});
