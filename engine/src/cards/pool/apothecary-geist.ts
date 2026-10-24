import { defineCard } from "../define.js";

export default defineCard({
  name: "Apothecary Geist",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, if you control another Spirit, you gain 3 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Spirit" }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this creature enters, if you control another Spirit, you gain 3 life.",
    },
  ],
});
