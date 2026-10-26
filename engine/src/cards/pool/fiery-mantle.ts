import { defineCard } from "../define.js";

// EDHREC rank 20325.

export default defineCard({
  name: "Fiery Mantle",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{R}: Enchanted creature gets +1/+0 until end of turn.\nWhen this Aura is put into a graveyard from the battlefield, return it to its owner's hand.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "attached", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: Enchanted creature gets +1/+0 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.",
    },
  ],
});
