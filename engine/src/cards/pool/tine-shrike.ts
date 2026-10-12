import { defineCard } from "../define.js";

export default defineCard({
  name: "Tine Shrike",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Bird"],
  power: 2,
  toughness: 1,
  keywords: ["flying", "infect"],
  text: "Flying\nInfect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
});
