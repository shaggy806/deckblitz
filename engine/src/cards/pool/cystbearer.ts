import { defineCard } from "../define.js";

export default defineCard({
  name: "Cystbearer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 2,
  toughness: 3,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
});
