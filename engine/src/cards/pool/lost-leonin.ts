import { defineCard } from "../define.js";

export default defineCard({
  name: "Lost Leonin",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cat", "Soldier"],
  power: 2,
  toughness: 1,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
});
