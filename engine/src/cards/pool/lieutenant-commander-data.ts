import { defineCard } from "../define.js";

// EDHREC rank 26335.

const CAST_TEXT = "Whenever a player casts a noncreature spell, put a +1/+1 counter on Lieutenant Commander Data.";
const DRAW_TEXT = "{1}, Remove three counters from among creatures you control: Draw a card.";

// "Three counters" of any kinds, from among any creatures you control.
export default defineCard({
  name: "Lieutenant Commander Data",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Android", "Scientist"],
  power: 2,
  toughness: 2,
  text: `${CAST_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "any", count: 3, from: { type: "creature" }, among: true } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
