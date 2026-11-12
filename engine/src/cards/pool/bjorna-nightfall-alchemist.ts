import { defineCard } from "../define.js";

// EDHREC rank 12258.

const ACTIVATE_TEXT =
  "{T}, Sacrifice an artifact: Bjorna, Nightfall Alchemist deals 1 damage to target creature. Goad that creature. (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)";

export default defineCard({
  name: "Bjorna, Nightfall Alchemist",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 3,
  pairing: { kind: "partner-group", group: "Friends forever" },
  text: `${ACTIVATE_TEXT}\nPartner—Friends forever (You can have two commanders if both have this ability.)`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "goad", target: 0 },
        ],
      },
      resolve: null,
      text: ACTIVATE_TEXT,
    },
  ],
});
