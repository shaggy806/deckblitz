import { defineCard } from "../define.js";

// EDHREC rank 16875.
// Makes Elf → use "2/2 Black Green Elf Token".

export default defineCard({
  name: "Stoic Grove-Guide",
  manaCost: "{4}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 5,
  toughness: 4,
  text: "{1}{B/G}, Exile this card from your graveyard: Create a 2/2 black and green Elf creature token. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{1}{B/G}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "2/2 Black Green Elf Token", count: 1 },
      resolve: null,
      text: "{1}{B/G}, Exile this card from your graveyard: Create a 2/2 black and green Elf creature token. Activate only as a sorcery.",
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
