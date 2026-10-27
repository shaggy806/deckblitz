import { defineCard } from "../define.js";

export default defineCard({
  name: "Flowstone Armor",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "You may choose not to untap this artifact during your untap step.\n{3}, {T}: Target creature gets +1/-1 for as long as this artifact remains tapped.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: 1,
        toughness: -1,
        duration: "while-source-tapped",
      },
      resolve: null,
      text: "{3}, {T}: Target creature gets +1/-1 for as long as this artifact remains tapped.",
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
