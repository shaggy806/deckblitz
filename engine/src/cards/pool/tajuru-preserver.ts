import { defineCard } from "../define.js";

export default defineCard({
  name: "Tajuru Preserver",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 2,
  toughness: 1,
  text: "Spells and abilities your opponents control can't cause you to sacrifice permanents.",
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "be-caused", who: "you", what: "sacrifice" }], text: "Spells and abilities your opponents control can't cause you to sacrifice permanents." }],
});
