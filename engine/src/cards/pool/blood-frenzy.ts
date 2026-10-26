import { defineCard } from "../define.js";

// EDHREC rank 20027. "Before the combat damage step" is the steps up to and
// including declare blockers (Angus Mackenzie's restriction).

export default defineCard({
  name: "Blood Frenzy",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Cast this spell only before the combat damage step.\nTarget attacking or blocking creature gets +4/+0 until end of turn. Destroy that creature at the beginning of the next end step.",
  castOnlyIf: {
    kind: "turn-structure",
    steps: ["upkeep", "draw", "precombat-main", "begin-combat", "declare-attackers", "declare-blockers"],
  },
  targets: ["attacking-or-blocking-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 4, toughness: 0, duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "destroy", target: 0 },
        text: "Destroy that creature at the beginning of the next end step.",
      },
    ],
  },
});
