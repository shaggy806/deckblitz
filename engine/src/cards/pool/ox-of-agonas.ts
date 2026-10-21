import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, discard your hand, then draw three cards.";

export default defineCard({
  name: "Ox of Agonas",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ox"],
  power: 4,
  toughness: 2,
  text:
    `${ENTER_TEXT}\n` +
    "Escape—{R}{R}, Exile eight other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)\n" +
    "This creature escapes with a +1/+1 counter on it.",
  escape: { cost: "{R}{R}", exileCount: 8, counters: { kind: "+1/+1", amount: 1 } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: 3 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
