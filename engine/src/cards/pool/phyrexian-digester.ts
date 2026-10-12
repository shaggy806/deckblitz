import { defineCard } from "../define.js";

export default defineCard({
  name: "Phyrexian Digester",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 2,
  toughness: 1,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
});
