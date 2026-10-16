import { defineCard } from "../define.js";

const TEXT =
  "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn. Suspect it. (It has menace and can't block.)";

export default defineCard({
  name: "Caught Red-Handed",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  cantBeCountered: true,
  text: `This spell can't be countered. (This includes by the ward ability.)\n${TEXT}`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      // Suspected past the end of turn: it stays so until it leaves the
      // battlefield or something ends it (rule 701.60).
      { kind: "suspect", target: 0 },
    ],
  },
});
