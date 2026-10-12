import { defineCard } from "../define.js";

export default defineCard({
  name: "Bloated Toad",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog"],
  power: 2,
  toughness: 2,
  cycling: { cost: "{2}" },
  text: "Protection from blue\nCycling {2} ({2}, Discard this card: Draw a card.)",
  static: [{ affects: { scope: "self" }, protection: { colors: ["U"] }, text: "Protection from blue" }],
});
