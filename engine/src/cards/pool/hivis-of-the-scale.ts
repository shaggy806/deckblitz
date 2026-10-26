import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 30103.
//
// "Target Dragon" is any Dragon permanent; the control lasts while Hivis's
// controller controls it and it stays tapped (Rubinia Soulsinger's shape).

export default defineCard({
  name: "Hivis of the Scale",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Lizard", "Shaman"],
  power: 3,
  toughness: 4,
  text: "You may choose not to untap Hivis during your untap step.\n{T}: Gain control of target Dragon for as long as you control Hivis and Hivis remains tapped.",
  static: [
    {
      affects: { scope: "self" },
      mayChooseNotToUntap: true,
      text: "You may choose not to untap Hivis during your untap step.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Dragon" } }],
      effect: {
        kind: "gain-control",
        target: 0,
        untilEndOfTurn: false,
        whileYouControlSource: true,
        whileSourceTapped: true,
      },
      resolve: null,
      text: "{T}: Gain control of target Dragon for as long as you control Hivis and Hivis remains tapped.",
    },
  ],
});
