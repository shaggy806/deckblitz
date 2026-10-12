import { defineCard } from "../define.js";

export default defineCard({
  name: "Soaring Sandwing",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  cycling: { cost: "{2}", search: { subtype: "Plains" } },
  text: "Flying\nWhen this creature enters, you gain 3 life.\nPlainscycling {2} ({2}, Discard this card: Search your library for a Plains card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this creature enters, you gain 3 life.",
    },
  ],
});
