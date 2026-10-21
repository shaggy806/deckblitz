import { defineCard } from "../define.js";

// EDHREC rank 19353.

const UNTAP_TEXT = "You may choose not to untap Rubinia Soulsinger during your untap step.";

export default defineCard({
  name: "Rubinia Soulsinger",
  manaCost: "{2}{G}{W}{U}",
  colors: ["G", "U", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 2,
  toughness: 3,
  text: "You may choose not to untap Rubinia Soulsinger during your untap step.\n{T}: Gain control of target creature for as long as you control Rubinia Soulsinger and Rubinia Soulsinger remains tapped.",
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true, whileSourceTapped: true },
      resolve: null,
      text: "{T}: Gain control of target creature for as long as you control Rubinia Soulsinger and Rubinia Soulsinger remains tapped.",
    },
  ],
});
