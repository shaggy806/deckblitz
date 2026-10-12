import { defineCard } from "../define.js";

export default defineCard({
  name: "Psionic Snoop",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 0,
  toughness: 3,
  keywords: ["flash"],
  text: "Flash\nWhen this creature enters, it connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: "When this creature enters, it connives.",
    },
  ],
});
