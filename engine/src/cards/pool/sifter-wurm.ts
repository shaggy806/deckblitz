import { defineCard } from "../define.js";

// Track Down's scry-then-reveal: the revealed card is target 0 of `then`, and
// stays on top. A card with {X} counts X as 0 in the library (its ruling).
const ENTER_TEXT =
  "When this creature enters, scry 3, then reveal the top card of your library. You gain life equal to that card's mana value.";

export default defineCard({
  name: "Sifter Wurm",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "scry",
        amount: 3,
        then: { kind: "reveal-top", then: { kind: "gain-life", amount: { manaValueOf: 0 } } },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
