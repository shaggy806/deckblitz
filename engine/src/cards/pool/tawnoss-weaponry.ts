import { defineCard } from "../define.js";

// EDHREC rank 31641.

const UNTAP_TEXT = "You may choose not to untap this artifact during your untap step.";

export default defineCard({
  name: "Tawnos's Weaponry",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "You may choose not to untap this artifact during your untap step.\n{2}, {T}: Target creature gets +1/+1 for as long as this artifact remains tapped.",
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "while-source-tapped" },
      resolve: null,
      text: "{2}, {T}: Target creature gets +1/+1 for as long as this artifact remains tapped.",
    },
  ],
});
