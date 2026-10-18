import { defineCard } from "../define.js";

// "It's a land in addition to its other types" is a static, so it applies
// only on the battlefield: cast transformed, the spell is a creature spell
// and no land (the ruling); on the battlefield it's a land creature.

const LAND_TEXT = "As long as this creature is on the battlefield, it's a land in addition to its other types.";

export default defineCard({
  name: "Awakened Skyclave",
  art: "https://cards.scryfall.io/art_crop/back/8/f/8fed056f-a8f5-41ec-a7d2-a80a238872d1.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance", "haste"],
  text: `Vigilance, haste\n${LAND_TEXT}\n{T}: Add one mana of any color.`,
  static: [{ affects: { scope: "self" }, addTypes: ["land"], text: LAND_TEXT }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
  faces: ["Invasion of Zendikar", "Awakened Skyclave"],
  transform: true,
});
