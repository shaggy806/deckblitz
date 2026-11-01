import { defineCard } from "../define.js";

// EDHREC rank 20761. One ability with two trigger conditions (rule 113.6k):
// "when this creature dies" works from the battlefield, looking back
// (603.10a); "when you discard this card" from the graveyard the discard
// puts it in, whatever made you discard it. Authored as one trigger each.

const TEXT =
  "When this creature dies and when you discard this card, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";

export default defineCard({
  name: "Bartered Cow",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Ox"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "this-discarded" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
