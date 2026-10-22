import { defineCard } from "../define.js";

// Amonkhet. Both sets are fixed as it resolves (the ruling): Zombies get
// +2/+1, every other creature you control +1/+1.
export default defineCard({
  name: "In Oketra's Name",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Zombies you control get +2/+1 until end of turn. Other creatures you control get +1/+1 until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Zombie", controlledBy: "you" },
        power: 2,
        toughness: 1,
        duration: "end-of-turn",
      },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", notSubtypes: ["Zombie"], controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
    ],
  },
});
