import { defineCard } from "../define.js";

// EDHREC rank 25565. Chroma over the mana costs of permanents you control is
// devotion to red (rule 700.5 — hybrid symbols count, as for chroma).
//
// Rulings:
//   [2008-08-01] Chroma abilities count hybrid mana symbols of the appropriate color.
//   [2008-08-01] The effect counts the mana symbols in this card's mana cost as well.

const TEXT =
  "Chroma — When this creature enters, it deals damage to target creature equal to the number of red mana symbols in the mana costs of permanents you control.";

export default defineCard({
  name: "Outrage Shaman",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: { devotionTo: "R" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
