import { defineCard } from "../define.js";

// EDHREC rank 1344.

export default defineCard({
  name: "Dolmen Gate",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "Prevent all combat damage that would be dealt to attacking creatures you control.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: true,
        prevent: true,
        toFilter: { type: "creature", attacking: true, controlledBy: "you" },
      },
      text: "Prevent all combat damage that would be dealt to attacking creatures you control.",
    },
  ],
});
