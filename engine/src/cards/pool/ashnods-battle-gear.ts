import { defineCard } from "../define.js";

// EDHREC rank 30511. The bonus lasts while this stays tapped (rule 611.2b), whoever controls
// the creature by then.

const UNTAP_TEXT = "You may choose not to untap this artifact during your untap step.";

export default defineCard({
  name: "Ashnod's Battle Gear",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "You may choose not to untap this artifact during your untap step.\n{2}, {T}: Target creature you control gets +2/-2 for as long as this artifact remains tapped.",
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: -2, duration: "while-source-tapped" },
      resolve: null,
      text: "{2}, {T}: Target creature you control gets +2/-2 for as long as this artifact remains tapped.",
    },
  ],
});
