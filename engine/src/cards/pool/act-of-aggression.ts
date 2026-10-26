import { defineCard } from "../define.js";

// EDHREC rank 9197. Conquering Manticore's threaten on an instant with
// Phyrexian mana.
export default defineCard({
  name: "Act of Aggression",
  manaCost: "{3}{R/P}{R/P}",
  colors: ["R"],
  types: ["instant"],
  text: "({R/P} can be paid with either {R} or 2 life.)\nGain control of target creature an opponent controls until end of turn. Untap that creature. It gains haste until end of turn.",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
