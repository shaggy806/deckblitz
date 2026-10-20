import { defineCard } from "../define.js";

const TEXT = "This creature enters with a +1/+1 counter on it for each creature that died this turn.";

export default defineCard({
  name: "Grizzly Ghoul",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Zombie", "Bear"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  static: [
    {
      // Every creature that died this turn, whoever controlled it.
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { creaturesDiedThisTurn: true, anyController: true } },
      },
      text: TEXT,
    },
  ],
});
