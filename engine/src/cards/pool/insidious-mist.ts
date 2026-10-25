import { defineCard } from "../define.js";

const EVASION_TEXT = "This creature can't block and can't be blocked.";
const ATTACK_TEXT =
  "Whenever this creature attacks and isn't blocked, you may pay {2}{B}. If you do, transform it.";

export default defineCard({
  name: "Insidious Mist",
  art: "https://cards.scryfall.io/art_crop/back/a/3/a32ce90d-9138-4aca-aa3c-a558dd16fad8.jpg",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 1,
  keywords: ["hexproof", "indestructible"],
  text: `Hexproof, indestructible\n${EVASION_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      grantKeywords: ["unblockable"],
      text: EVASION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{B} to transform Insidious Mist?",
        cost: "{2}{B}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Elusive Tormentor", "Insidious Mist"],
  transform: true,
});
