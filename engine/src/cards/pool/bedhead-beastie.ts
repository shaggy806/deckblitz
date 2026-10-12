import { defineCard } from "../define.js";

export default defineCard({
  name: "Bedhead Beastie",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 6,
  keywords: ["menace"],
  cycling: { cost: "{2}", search: { subtype: "Mountain" } },
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nMountaincycling {2} ({2}, Discard this card: Search your library for a Mountain card, reveal it, put it into your hand, then shuffle.)",
});
