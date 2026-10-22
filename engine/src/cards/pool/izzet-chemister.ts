import { defineCard } from "../define.js";

// EDHREC rank 13536.
//
// Rulings: the exiled cards are cast while the last ability resolves, one at a
// time in any order, never later (a sorcery at any time); X is 0; cards not
// cast stay exiled. Only cards this Chemister exiled (rule 607.2a, `linked`),
// so if it leaves before the last ability is activated they're lost.

export default defineCard({
  name: "Izzet Chemister",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 1,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste\n{R}, {T}: Exile target instant or sorcery card from your graveyard.\n{1}{R}, {T}, Sacrifice this creature: Cast any number of cards exiled with this creature without paying their mana costs.",
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["instant", "sorcery"] },
        },
      ],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: "{R}, {T}: Exile target instant or sorcery card from your graveyard.",
    },
    {
      cost: { mana: "{1}{R}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "cast-now", from: "exiled-with-source", free: true, repeat: true },
      resolve: null,
      text: "{1}{R}, {T}, Sacrifice this creature: Cast any number of cards exiled with this creature without paying their mana costs.",
    },
  ],
});
