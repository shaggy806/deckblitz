import { defineCard } from "../define.js";

// EDHREC rank 30875. Goblin War Cry's text and shape.
export default defineCard({
  name: "Eunuchs' Intrigues",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target opponent chooses a creature they control. Other creatures they control can't block this turn.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        who: { target: 0 },
        for: { permanent: { type: "creature", controlledBy: "you" }, own: true },
      },
      {
        kind: "for-each-voted",
        which: "voted",
        effect: {
          kind: "restrict",
          filter: { type: "creature", controlledBy: "you" },
          controlledByTarget: 0,
          exceptTarget: 0,
          restrictions: ["cant-block"],
        },
      },
    ],
  },
});
