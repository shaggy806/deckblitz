import { defineCard } from "../define.js";

// EDHREC rank 24390.

const UNTAP_TEXT = "You may choose not to untap this creature during your untap step.";

export default defineCard({
  name: "Willow Satyr",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Satyr"],
  power: 1,
  toughness: 1,
  text: "You may choose not to untap this creature during your untap step.\n{T}: Gain control of target legendary creature for as long as you control this creature and this creature remains tapped.",
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", supertype: "legendary" } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true, whileSourceTapped: true },
      resolve: null,
      text: "{T}: Gain control of target legendary creature for as long as you control this creature and this creature remains tapped.",
    },
  ],
});
