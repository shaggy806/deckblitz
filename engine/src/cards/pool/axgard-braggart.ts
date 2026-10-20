import { defineCard } from "../define.js";

// EDHREC rank 27523. Kaldheim. It can be activated while already untapped,
// and still gets the counter (the ruling).

export default defineCard({
  name: "Axgard Braggart",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 3,
  toughness: 3,
  text: "Boast — {1}{W}: Untap this creature. Put a +1/+1 counter on it. (Activate only if this creature attacked this turn and only once each turn.)",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "source" },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: "Boast — {1}{W}: Untap this creature. Put a +1/+1 counter on it.",
      boast: true,
    },
  ],
});
