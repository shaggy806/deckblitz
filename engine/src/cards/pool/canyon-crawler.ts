import { defineCard } from "../define.js";

export default defineCard({
  name: "Canyon Crawler",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spider", "Beast"],
  power: 6,
  toughness: 6,
  keywords: ["deathtouch"],
  cycling: { cost: "{2}", search: { subtype: "Swamp" } },
  text: "Deathtouch\nWhen this creature enters, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\nSwampcycling {2} ({2}, Discard this card: Search your library for a Swamp card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Food token.",
    },
  ],
});
