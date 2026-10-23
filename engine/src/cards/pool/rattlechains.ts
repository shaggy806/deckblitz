import { defineCard } from "../define.js";

const ENTERS_TEXT = "When this creature enters, target Spirit gains hexproof until end of turn.";
const FLASH_TEXT = "You may cast Spirit spells as though they had flash.";

export default defineCard({
  name: "Rattlechains",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ENTERS_TEXT}\n${FLASH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // "Target Spirit": any Spirit on the battlefield, whoever controls it.
      targets: [{ kind: "permanent", filter: { subtype: "Spirit" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      castAsThoughFlash: { subtype: "Spirit" },
      text: FLASH_TEXT,
    },
  ],
});
