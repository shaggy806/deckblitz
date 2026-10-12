import { defineCard } from "../define.js";

export default defineCard({
  name: "Priests of Norn",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 1,
  toughness: 4,
  keywords: ["vigilance", "infect"],
  text: "Vigilance\nInfect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
});
