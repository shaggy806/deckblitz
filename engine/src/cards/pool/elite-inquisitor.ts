import { defineCard } from "../define.js";

const PROTECTION_TEXT = "Protection from Vampires, from Werewolves, and from Zombies";

export default defineCard({
  name: "Elite Inquisitor",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike", "vigilance"],
  text: `First strike, vigilance\n${PROTECTION_TEXT}`,
  static: [
    { affects: { scope: "self" }, protection: { filter: { subtype: "Vampire" } }, text: PROTECTION_TEXT },
    { affects: { scope: "self" }, protection: { filter: { subtype: "Werewolf" } }, text: PROTECTION_TEXT },
    { affects: { scope: "self" }, protection: { filter: { subtype: "Zombie" } }, text: PROTECTION_TEXT },
  ],
});
