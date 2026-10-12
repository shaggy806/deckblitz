import { defineCard } from "../define.js";

export default defineCard({
  name: "Wildslayer Elves",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["wither"],
  text: "Wither (This deals damage to creatures in the form of -1/-1 counters.)",
});
