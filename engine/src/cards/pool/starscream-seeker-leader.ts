import { defineCard } from "../define.js";

// Back face of Starscream, Power Hungry. Living metal (rule 702.161a): during
// your turn it's an artifact creature as well, at its printed power and
// toughness (the ruling).
const LIVING_METAL_TEXT = "Living metal (During your turn, this Vehicle is also a creature.)";

export default defineCard({
  name: "Starscream, Seeker Leader",
  art: "https://cards.scryfall.io/art_crop/back/8/2/8234ea77-9ed6-4f3e-acc2-f52fb7003ed2.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "menace", "haste"],
  text: `${LIVING_METAL_TEXT}\nFlying, menace, haste\nWhenever Starscream deals combat damage to a player, if there is no monarch, that player becomes the monarch.\nWhenever you become the monarch, convert Starscream.`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "monarch", who: "nobody" },
      targets: [],
      effect: { kind: "become-monarch", who: "trigger-player" },
      resolve: null,
      text: "Whenever Starscream deals combat damage to a player, if there is no monarch, that player becomes the monarch.",
    },
    {
      trigger: { on: "event", event: "becomes-monarch", who: "you" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "Whenever you become the monarch, convert Starscream.",
    },
  ],
  static: [{ affects: { scope: "self" }, condition: { kind: "your-turn" }, addTypes: ["creature"], text: LIVING_METAL_TEXT }],
  faces: ["Starscream, Power Hungry", "Starscream, Seeker Leader"],
  transform: true,
});
