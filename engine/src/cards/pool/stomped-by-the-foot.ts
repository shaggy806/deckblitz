import { defineCard } from "../define.js";

export default defineCard({
  name: "Stomped by the Foot",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Kicker—Sacrifice an artifact or creature. (You may sacrifice an artifact or creature in addition to any other costs as you cast this spell.)\nTarget creature gets -2/-2 until end of turn. If this spell was kicked, that creature gets -5/-5 until end of turn instead.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
  kicker: {
    cost: "",
    also: { text: "Sacrifice an artifact or creature", sacrifice: { filter: { typesAnyOf: ["artifact", "creature"] }, count: 1 } },
    effect: { kind: "modify-pt", target: 0, power: -5, toughness: -5, duration: "end-of-turn" },
  },
});
