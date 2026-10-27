import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 21648.
//
// Ruling: Goblins are black only (layer 5 sets the colour) and Zombies in
// addition to their other types (layer 4); statics apply as one enters.

const PUMP = "All Goblins get +1/+1.";
const TYPE = "All Goblins are black and are Zombies in addition to their other creature types.";

export default defineCard({
  name: "Dralnu's Crusade",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: `${PUMP}\n${TYPE}`,
  static: [
    { affects: { scope: "filter", filter: { subtype: "Goblin" } }, grantPt: [1, 1], text: PUMP },
    {
      affects: { scope: "filter", filter: { subtype: "Goblin" } },
      setColors: ["B"],
      addSubtypes: ["Zombie"],
      text: TYPE,
    },
  ],
});
