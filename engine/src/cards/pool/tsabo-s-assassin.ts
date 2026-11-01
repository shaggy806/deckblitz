import { defineCard } from "../define.js";

// A `conditional` reading its target's colors at resolution (`most-common-color`'s
// `sharedBy: { target: 0 }`).

const TEXT = "{T}: Destroy target creature if it shares a color with the most common color among all permanents or a color tied for most common. A creature destroyed this way can't be regenerated.";

export default defineCard({
  name: "Tsabo's Assassin",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Assassin"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "conditional",
        condition: { kind: "most-common-color", sharedBy: { target: 0 } },
        then: { kind: "destroy", target: 0, cantBeRegenerated: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
