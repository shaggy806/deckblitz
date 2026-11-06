import { defineCard } from "../define.js";

export default defineCard({
  name: "Grand Nagus Zek",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ferengi", "Noble"],
  power: 1,
  toughness: 1,
  text: "Grand Nagus Zek gets +1/+1 for each Treasure you control.\nWhenever another creature dies, create a Treasure token. This ability triggers only once each turn. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Treasure", controlledBy: "you" }, pt: [1, 1] },
      text: "Grand Nagus Zek gets +1/+1 for each Treasure you control.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "Whenever another creature dies, create a Treasure token. This ability triggers only once each turn.",
      oncePerTurn: true,
    },
  ],
});
