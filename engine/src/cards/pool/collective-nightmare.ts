import { defineCard } from "../define.js";

export default defineCard({
  name: "Collective Nightmare",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nTarget creature gets -3/-3 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
});
