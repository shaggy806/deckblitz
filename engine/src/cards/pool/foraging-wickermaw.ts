import { defineCard } from "../define.js";

// EDHREC rank 17386.

// Gravestone Strider's mana ability, with an `also` that sets this creature's
// colors to the one the mana was made in (`become`'s `setColorsToManaMade`),
// still without using the stack (rule 605.3b).
const MANA = "{1}: Add one mana of any color. This creature becomes that color until end of turn. Activate only once each turn.";

export default defineCard({
  name: "Foraging Wickermaw",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 1,
  toughness: 3,
  text: `When this creature enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)\n${MANA}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "When this creature enters, surveil 1.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: { kind: "become", target: "source", setColorsToManaMade: true, duration: "end-of-turn" },
      },
      resolve: null,
      text: MANA,
      oncePerTurn: true,
    },
  ],
});
