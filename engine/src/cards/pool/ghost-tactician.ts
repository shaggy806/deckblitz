import { defineCard } from "../define.js";

// EDHREC rank 31672.

const TEXT = "{W}, {T}, Discard a card: Creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Ghost Tactician",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Spellshaper"],
  power: 2,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
