import { defineCard } from "../define.js";

const TEXT =
  '{B}, {T}, Discard a card: Create a 1/1 black Zombie Goblin creature token named Festering Goblin. It has "When this token dies, target creature gets -1/-1 until end of turn."';

export default defineCard({
  name: "Skirk Ridge Exhumer",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Festering Goblin Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
