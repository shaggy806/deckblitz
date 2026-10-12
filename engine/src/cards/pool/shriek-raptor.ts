import { defineCard } from "../define.js";

export default defineCard({
  name: "Shriek Raptor",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Bird"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "infect"],
  text: "Flying\nInfect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
});
