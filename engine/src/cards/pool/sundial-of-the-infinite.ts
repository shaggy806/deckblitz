import { defineCard } from "../define.js";

// EDHREC rank 2795.

export default defineCard({
  name: "Sundial of the Infinite",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{1}, {T}: End the turn. Activate only during your turn. (Exile all spells and abilities from the stack. Discard down to your maximum hand size. Damage wears off, and \"this turn\" and \"until end of turn\" effects end.)",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "end-the-turn" },
      resolve: null,
      text: "{1}, {T}: End the turn. Activate only during your turn.",
      condition: { kind: "your-turn" },
    },
  ],
});
