import { defineCard } from "../define.js";

const FLAME_TEXT = "Breathe Flame — Klauth's Will deals X damage to each creature without flying.";
const RELICS_TEXT = "Smash Relics — Destroy up to X target artifacts and/or enchantments.";

// Drown in Dreams' commander-gated "choose both"; the Smash Relics group is in
// the last mode, the only one with targets (rule 700.2).
export default defineCard({
  name: "Klauth's Will",
  manaCost: "{X}{R}{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: `Choose one. If you control a commander as you cast this spell, you may choose both instead.\n• ${FLAME_TEXT}\n• ${RELICS_TEXT}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: { condition: { kind: "controls", filter: { isCommander: true }, atLeast: 1 }, maxModes: 2 },
    modes: [
      {
        text: FLAME_TEXT,
        targets: [],
        effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: "x" },
      },
      {
        text: RELICS_TEXT,
        targets: [{ kind: "any-number", of: "artifact-or-enchantment", max: "x" }],
        effect: {
          kind: "for-each-target",
          from: 0,
          simultaneous: true,
          effect: { kind: "destroy", target: 0 },
        },
      },
    ],
  },
});
