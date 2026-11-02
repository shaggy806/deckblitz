import { defineCard } from "../define.js";

const HEXPROOF_TEXT = "Ruric Thar has hexproof as long as they haven't dealt combat damage yet.";

export default defineCard({
  name: "Ruric Thar, Magecrusher",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Ogre", "Warrior"],
  power: 7,
  toughness: 7,
  keywords: ["reach", "vigilance", "trample"],
  cantBeCountered: true,
  text: `This spell can't be countered.\nReach, vigilance, trample\n${HEXPROOF_TEXT} (They can't be the target of spells or abilities your opponents control.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-hasnt-dealt-damage", combat: true },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
});
