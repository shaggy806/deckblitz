import { defineCard } from "../define.js";

// EDHREC rank 22334.
const ETB_TEXT =
  "When this creature enters, tap target creature an opponent controls. Put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "Fractal Mascot",
  manaCost: "{4}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Fractal", "Elk"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
