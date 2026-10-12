import { defineCard } from "../define.js";

export default defineCard({
  name: "Phyrexian Crusader",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike", "infect"],
  text: "First strike, protection from red and from white\nInfect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["R", "W"] },
      text: "Protection from red and from white",
    },
  ],
});
