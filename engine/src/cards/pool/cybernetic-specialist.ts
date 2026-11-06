import { defineCard } from "../define.js";

// EDHREC rank 29264.

const ENTER_TEXT =
  "When this creature enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)";
const BOTTOM_TEXT = "{1}, {T}: Put target card from your graveyard on the bottom of your library.";

export default defineCard({
  name: "Cybernetic Specialist",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Scientist"],
  power: 2,
  toughness: 1,
  text: `${ENTER_TEXT}\n${BOTTOM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: {} }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: BOTTOM_TEXT,
    },
  ],
});
