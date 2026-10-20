import { defineCard } from "../define.js";

const DAY_TEXT = "If it's neither day nor night, it becomes day as this creature enters.";
const LOOK_TEXT =
  "Whenever day becomes night or night becomes day, look at the top four cards of your library. You may reveal a creature card with mana value 3 or less from among them and put it into your hand. Put the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Gavony Dawnguard",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  becomesDayAsEnters: true,
  text: `Ward {1}\n${DAY_TEXT}\n${LOOK_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{1}" } },
      resolve: null,
      text: "Ward {1}",
    },
    {
      trigger: { on: "day-night-changes" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
