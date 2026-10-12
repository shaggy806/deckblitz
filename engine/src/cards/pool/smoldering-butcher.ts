import { defineCard } from "../define.js";

export default defineCard({
  name: "Smoldering Butcher",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 4,
  toughness: 2,
  keywords: ["wither"],
  text: "Wither (This deals damage to creatures in the form of -1/-1 counters.)",
});
