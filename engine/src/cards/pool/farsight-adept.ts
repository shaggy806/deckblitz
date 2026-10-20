import { defineCard } from "../define.js";

// EDHREC rank 20769. Zendikar Rising. Loran of the Third Path's shape; an
// illegal target means you don't draw either (the ruling).

const TEXT = "When this creature enters, you and target opponent each draw a card.";

export default defineCard({
  name: "Farsight Adept",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "draw", amount: 1, target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
