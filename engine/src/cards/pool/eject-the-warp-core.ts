import { defineCard } from "../define.js";

// EDHREC rank 32208.

export default defineCard({
  name: "Eject the Warp Core",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Kicker—Sacrifice an artifact or creature. (You may sacrifice an artifact or creature in addition to any other costs as you cast this spell.)\nTarget creature gets -2/-2 until end of turn. If this spell was kicked, that creature gets -6/-6 until end of turn instead.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
  kicker: {
    cost: "",
    also: {
      sacrifice: { filter: { typesAnyOf: ["artifact", "creature"] }, count: 1 },
      text: "Sacrifice an artifact or creature",
    },
    effect: { kind: "modify-pt", target: 0, power: -6, toughness: -6, duration: "end-of-turn" },
  },
});
