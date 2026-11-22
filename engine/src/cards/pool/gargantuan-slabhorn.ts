import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// "Transformed permanents" are double-faced permanents with their back face
// up (rule 701.27g) — melded and merged ones never are (`transformed`).

const OTHERS_TEXT = "Other transformed permanents you control have trample and ward {2}.";

export default defineCard({
  name: "Gargantuan Slabhorn",
  art: "https://cards.scryfall.io/art_crop/back/5/0/50180fda-6d67-41e9-8b2b-2e7c5876b8ab.jpg",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample, ward {2}\n${OTHERS_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { transformed: true, controlledBy: "you" }, excludeSelf: true },
      grantKeywords: ["trample"],
      grantsTriggered: [ward({ mana: "{2}" })],
      text: OTHERS_TEXT,
    },
  ],
  triggered: [ward({ mana: "{2}" })],
  faces: ["Invasion of Pyrulea", "Gargantuan Slabhorn"],
  transform: true,
});
