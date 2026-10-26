import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 13206.
//
// Rulings:
//   [2021-03-19] Unlike the card Llanowar Elves, the token has no mana cost. Its mana value is 0.

const TEXT =
  '{G}, {T}, Discard a card: Create a 1/1 green Elf Druid creature token named Llanowar Elves. It has "{T}: Add {G}."';

export default defineCard({
  name: "Llanowar Mentor",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Llanowar Elves Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
