import { defineCard } from "../define.js";

export default defineCard({
  name: "Ephemeral Shields",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nTarget creature gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  targets: ["creature"],
  effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
});
