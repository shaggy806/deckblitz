import { defineCard } from "../define.js";

// Bone Devourer's replacement, counting only the creatures that died under its controller.
const TEXT =
  "This creature enters with a +1/+1 counter on it for each creature that died under your control this turn.";

export default defineCard({
  name: "Callous Sell-Sword",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { creaturesDiedThisTurn: true } },
      },
      text: TEXT,
    },
  ],
  faces: ["Callous Sell-Sword", "Burn Together"],
  adventure: true,
});
