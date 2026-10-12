import { defineCard } from "../define.js";

export default defineCard({
  name: "Gather Courage",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nTarget creature gets +2/+2 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
});
