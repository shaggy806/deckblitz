import { defineCard } from "../define.js";

// EDHREC rank 21677.
// Makes Zombie Rogue → use "Zombie Rogue Token".

export default defineCard({
  name: "Rictus Robber",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Rogue"],
  power: 4,
  toughness: 3,
  plot: { cost: "{2}{B}" },
  text: "When this creature enters, if a creature died this turn, create a 2/2 blue and black Zombie Rogue creature token.\nPlot {2}{B} (You may pay {2}{B} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Rogue Token", count: 1 },
      resolve: null,
      text: "When this creature enters, if a creature died this turn, create a 2/2 blue and black Zombie Rogue creature token.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
