import { defineCard } from "../define.js";

// "Become artifact creatures" keeps their other types (rule 205.1b), and their
// own P/T: `add-types`, not `animate-all`. A Vehicle made a creature by the
// first sentence gets the +2/+0 of the second.

const TEXT = "Vehicles you control become artifact creatures until end of turn. Creatures you control get +2/+0 until end of turn.";

export default defineCard({
  name: "Start Your Engines",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-permanent",
        filter: { subtype: "Vehicle", controlledBy: "you" },
        simultaneous: true,
        effect: { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
    ],
  },
});
