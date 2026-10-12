import { defineCard } from "../define.js";

export default defineCard({
  name: "Stratosoarer",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  cycling: { cost: "{1}{U}", search: { supertype: "basic", type: "land" } },
  text: "Flying\nWhen this creature enters, target creature gains flying until end of turn.\nBasic landcycling {1}{U} ({1}{U}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, target creature gains flying until end of turn.",
    },
  ],
});
