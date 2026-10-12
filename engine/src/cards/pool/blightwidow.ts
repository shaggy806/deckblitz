import { defineCard } from "../define.js";

export default defineCard({
  name: "Blightwidow",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Spider"],
  power: 2,
  toughness: 4,
  keywords: ["reach", "infect"],
  text: "Reach (This creature can block creatures with flying.)\nInfect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
});
