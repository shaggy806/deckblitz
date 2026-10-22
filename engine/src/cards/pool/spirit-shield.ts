import { defineCard } from "../define.js";

// EDHREC rank 31582.

export default defineCard({
  name: "Spirit Shield",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "You may choose not to untap this artifact during your untap step.\n{2}, {T}: Target creature gets +0/+2 for as long as this artifact remains tapped.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 0, toughness: 2, duration: "while-source-tapped" },
      resolve: null,
      text: "{2}, {T}: Target creature gets +0/+2 for as long as this artifact remains tapped.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayChooseNotToUntap: true,
      text: "You may choose not to untap this artifact during your untap step.",
    },
  ],
});
