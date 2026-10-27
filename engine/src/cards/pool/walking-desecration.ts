import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 27325. Extinction's type choice over Bident of
// Thassa's "attack this turn if able" rule (every player's creatures).

const TEXT = "{B}, {T}: Creatures of the creature type of your choice attack this turn if able.";

export default defineCard({
  name: "Walking Desecration",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}", tap: true },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: { kind: "restrict", filter: { type: "creature", subtype: "$chosen" }, restrictions: ["must-attack"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
