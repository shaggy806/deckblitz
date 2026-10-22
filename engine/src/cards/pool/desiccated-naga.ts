import { defineCard } from "../define.js";

// Amonkhet. Blood Hustler's drain behind "activate only if you control a
// Liliana planeswalker".
const TEXT =
  "{3}{B}: Target opponent loses 2 life and you gain 2 life. Activate only if you control a Liliana planeswalker.";

export default defineCard({
  name: "Desiccated Naga",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Snake"],
  power: 3,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      targets: ["opponent"],
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Liliana" }, atLeast: 1 },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, target: 0 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
