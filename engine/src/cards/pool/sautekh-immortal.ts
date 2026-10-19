import { defineCard } from "../define.js";

// EDHREC rank 16518.
//
// Every creature that died this turn, whoever controlled it (Spymaster's
// Vault's count), not only yours (Callous Sell-Sword's).

const TROOPS_TEXT =
  "Elite Troops — This creature enters with a +1/+1 counter on it for each creature that died this turn.";

export default defineCard({
  name: "Sautekh Immortal",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TROOPS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { creaturesDiedThisTurn: true, anyController: true } },
      },
      text: TROOPS_TEXT,
    },
  ],
});
