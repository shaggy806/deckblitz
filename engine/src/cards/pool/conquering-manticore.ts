import { defineCard } from "../define.js";

const ETB =
  "When this creature enters, gain control of target creature an opponent controls until end of turn. Untap that creature. It gains haste until end of turn.";

export default defineCard({
  name: "Conquering Manticore",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Manticore"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ETB}`,
  // Sauron, the Lidless Eye's threaten shape.
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ETB,
    },
  ],
});
