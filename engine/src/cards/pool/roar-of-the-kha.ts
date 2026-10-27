import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 22302. Entwine: Rain of Rust's shape.

export default defineCard({
  name: "Roar of the Kha",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: { cost: "{1}{W}", keyword: "entwine" },
  text: "Choose one —\n• Creatures you control get +1/+1 until end of turn.\n• Untap all creatures you control.\nEntwine {1}{W} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Creatures you control get +1/+1 until end of turn.",
        targets: [],
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 1,
          toughness: 1,
          duration: "end-of-turn",
        },
      },
      {
        text: "Untap all creatures you control.",
        targets: [],
        effect: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
      },
    ],
    kickedModes: 2,
  },
});
