import { defineCard } from "../define.js";

// EDHREC rank 8244.
//
// The bonus is read live, so it changes as the number of Elves you control
// does (the ruling). "You" is the Aura's controller.
const STATIC_TEXT = "Enchanted creature gets +1/+1 for each Elf you control and has reach.";
const RETURN_TEXT = "{2}{G}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Crown of Skemfar",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Elf", controlledBy: "you" }, pt: [1, 1] },
      grantKeywords: ["reach"],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
