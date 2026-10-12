import { defineCard } from "../define.js";

export default defineCard({
  name: "A.I.M. Scientists",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Villain"],
  power: 3,
  toughness: 3,
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "When this creature enters, it connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
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
