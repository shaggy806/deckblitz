import { defineCard } from "../define.js";

export default defineCard({
  name: "Warren-Scourge Elf",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 1,
  toughness: 1,
  text: "Protection from Goblins",
  static: [{ affects: { scope: "self" }, protection: { filter: { subtype: "Goblin" } }, text: "Protection from Goblins" }],
});
