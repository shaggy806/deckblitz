import { defineCard } from "../define.js";

// EDHREC rank 30855.

export default defineCard({
  name: "Zelyon Sword",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "You may choose not to untap this artifact during your untap step.\n{3}, {T}: Target creature gets +2/+0 for as long as this artifact remains tapped.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "while-source-tapped" },
      resolve: null,
      text: "{3}, {T}: Target creature gets +2/+0 for as long as this artifact remains tapped.",
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
