import { defineCard } from "../define.js";

// EDHREC rank 9376.
const ENTER_TEXT = "When this creature enters, you gain 2 life and scry 1.";

export default defineCard({
  name: "Holy Cow",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Ox", "Angel"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ENTER_TEXT} (Look at the top card of your library. You may put that card on the bottom.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
