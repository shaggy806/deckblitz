import { defineCard } from "../define.js";

export default defineCard({
  name: "Sickle Ripper",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 2,
  toughness: 1,
  keywords: ["wither"],
  text: "Wither (This deals damage to creatures in the form of -1/-1 counters.)",
});
