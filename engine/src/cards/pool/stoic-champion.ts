import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 30367.

const TEXT = "Whenever a player cycles a card, this creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Stoic Champion",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cycles", who: "any" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
