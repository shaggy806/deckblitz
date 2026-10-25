import { defineCard } from "../define.js";

// Mirage. EDHREC rank 24690.
//
// Rulings:
//   [2004-10-04] The ability counts creatures that went to the graveyard before this card entered
//     the battlefield.
//
// "Put into your graveyard from the battlefield" is a creature you *own* dying, whoever
// controlled it: every player's this-turn `died` list, filtered `ownedBy: "you"` as each
// creature last existed.

export default defineCard({
  name: "Asmira, Holy Avenger",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of each end step, put a +1/+1 counter on Asmira for each creature put into your graveyard from the battlefield this turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "+1/+1",
        amount: { turnHistory: "died", who: "each-player", filter: { type: "creature", ownedBy: "you" } },
      },
      resolve: null,
      text: "At the beginning of each end step, put a +1/+1 counter on Asmira for each creature put into your graveyard from the battlefield this turn.",
    },
  ],
});
