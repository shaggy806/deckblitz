import { defineCard } from "../define.js";

export default defineCard({
  name: "Harvest Gwyllion",
  manaCost: "{2}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Hag"],
  power: 2,
  toughness: 4,
  keywords: ["wither"],
  text: "Wither (This deals damage to creatures in the form of -1/-1 counters.)",
});
