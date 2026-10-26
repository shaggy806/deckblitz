import { defineCard } from "../define.js";

// EDHREC rank 15054.

export default defineCard({
  name: "Helm of Possession",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "You may choose not to untap this artifact during your untap step.\n{2}, {T}, Sacrifice a creature: Gain control of target creature for as long as you control this artifact and this artifact remains tapped.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "creature-you-control" },
      targets: ["creature"],
      effect: {
        kind: "gain-control",
        target: 0,
        untilEndOfTurn: false,
        whileYouControlSource: true,
        whileSourceTapped: true,
      },
      resolve: null,
      text: "{2}, {T}, Sacrifice a creature: Gain control of target creature for as long as you control this artifact and this artifact remains tapped.",
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
