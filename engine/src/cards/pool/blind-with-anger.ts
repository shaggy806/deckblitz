import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 20348. Threaten's shape, on a
// nonlegendary creature.

export default defineCard({
  name: "Blind with Anger",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Untap target nonlegendary creature and gain control of it until end of turn. That creature gains haste until end of turn.",
  targets: [{ kind: "permanent", filter: { type: "creature", notSupertype: "legendary" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
