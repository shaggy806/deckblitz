import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 18822. If the creature you control has become an illegal target,
// it gets no counter and nothing fights; if only the other one has, yours
// still gets the counter and nothing fights (the rulings).

const ENTER_TEXT =
  "When this Siege enters, put a +1/+1 counter on target creature you control. Then that creature fights up to one target creature you don't control.";

export default defineCard({
  name: "Invasion of Muraganda",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 6,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control", { kind: "optional", of: "creature-an-opponent-controls" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "fight", a: 0, b: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Muraganda", "Primordial Plasm"],
  transform: true,
});
