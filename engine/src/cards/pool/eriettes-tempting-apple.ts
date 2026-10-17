import { defineCard } from "../define.js";

// EDHREC rank 8349. Wilds of Eldraine. The enters trigger is Act of
// Treason's spell; the two sacrifice abilities are Dubious Delicacy's.
const ENTER_TEXT =
  "When Eriette's Tempting Apple enters, gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn.";
const GAIN_TEXT = "{2}, {T}, Sacrifice Eriette's Tempting Apple: You gain 3 life.";
const LOSE_TEXT = "{2}, {T}, Sacrifice Eriette's Tempting Apple: Target opponent loses 3 life.";

export default defineCard({
  name: "Eriette's Tempting Apple",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Food"],
  text: `${ENTER_TEXT}\n${GAIN_TEXT}\n${LOSE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: GAIN_TEXT,
    },
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: ["opponent"],
      effect: { kind: "lose-life", amount: 3, target: 0 },
      resolve: null,
      text: LOSE_TEXT,
    },
  ],
});
