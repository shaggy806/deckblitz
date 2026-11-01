import { defineCard } from "../define.js";

export default defineCard({
  name: "Kyler, Sigardian Emissary",
  manaCost: "{3}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "Whenever another Human you control enters, put a +1/+1 counter on Kyler.\nOther Humans you control get +1/+1 for each counter on Kyler.",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Human", excludeSelf: true },
      grantPtPerCount: { anyCountersOnSource: true, pt: [1, 1] },
      text: "Other Humans you control get +1/+1 for each counter on Kyler.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Human" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever another Human you control enters, put a +1/+1 counter on Kyler.",
    },
  ],
});
