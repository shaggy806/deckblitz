import { defineCard } from "../define.js";

export default defineCard({
  name: "Orchard Strider",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 6,
  toughness: 4,
  cycling: { cost: "{1}{G}", search: { supertype: "basic", type: "land" } },
  text: "When this creature enters, create two Food tokens. (They're artifacts with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\nBasic landcycling {1}{G} ({1}{G}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two Food tokens.",
    },
  ],
});
