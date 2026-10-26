import { defineCard } from "../define.js";
import { persist } from "../helpers.js";

// Eventide (EVE). EDHREC rank 19083.
//
// Cauldron of Souls' shape: the target gains the persist trigger itself, so
// the card that returns is a new object without it (the rulings).

const TEXT =
  "{2}: Target white creature gains persist until end of turn. (When it dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)";

export default defineCard({
  name: "Antler Skulkin",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", colors: ["W"] } }],
      effect: { kind: "grant-triggered", target: 0, ability: persist(), duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
