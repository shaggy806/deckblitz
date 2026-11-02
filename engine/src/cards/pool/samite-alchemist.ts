import { defineCard } from "../define.js";

// Homelands. "Your next untap step" is the activator's, on a creature they
// controlled as it was targeted (`untapStepOf`).

const TEXT =
  "{W}{W}, {T}: Prevent the next 4 damage that would be dealt this turn to target creature you control. Tap that creature. It doesn't untap during your next untap step.";

export default defineCard({
  name: "Samite Alchemist",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 0,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}{W}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "prevent-damage", target: 0, amount: 4 },
          { kind: "tap", target: 0, doesntUntapNext: true, untapStepOf: "you" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
