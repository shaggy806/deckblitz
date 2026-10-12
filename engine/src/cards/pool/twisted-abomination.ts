import { defineCard } from "../define.js";

export default defineCard({
  name: "Twisted Abomination",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Mutant"],
  power: 5,
  toughness: 3,
  cycling: { cost: "{2}", search: { subtype: "Swamp" } },
  text: "{B}: Regenerate this creature. (The next time this creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)\nSwampcycling {2} ({2}, Discard this card: Search your library for a Swamp card, reveal it, put it into your hand, then shuffle.)",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
});
