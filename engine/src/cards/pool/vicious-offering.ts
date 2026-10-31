import { defineCard } from "../define.js";

// Kicker whose cost is a sacrifice (rule 702.33a — "Kicker [cost]" is any
// cost): `cost: ""` and `also.sacrifice`, the creature chosen as the cost is
// paid once the spell is on the stack (601.2h). The kicked spell's effect
// replaces the unkicked one.

export default defineCard({
  name: "Vicious Offering",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Kicker—Sacrifice a creature. (You may sacrifice a creature in addition to any other costs as you cast this spell.)\nTarget creature gets -2/-2 until end of turn. If this spell was kicked, that creature gets -5/-5 until end of turn instead.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
  kicker: {
    cost: "",
    also: { text: "Sacrifice a creature", sacrifice: { filter: { type: "creature" }, count: 1 } },
    effect: { kind: "modify-pt", target: 0, power: -5, toughness: -5, duration: "end-of-turn" },
  },
});
