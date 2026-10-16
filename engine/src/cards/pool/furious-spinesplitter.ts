import { defineCard } from "../define.js";

// EDHREC rank 27154.
//
// Tymna the Weaver's count of opponents with a turn stat, over all damage
// (`"damage-taken"`, combat or not — dealt, so prevented damage doesn't
// count), however it was dealt and whether or not this creature was around
// for it (the ruling). Read as the trigger resolves.

const END_TEXT =
  "At the beginning of your end step, put a +1/+1 counter on this creature for each opponent who was dealt damage this turn.";

export default defineCard({
  name: "Furious Spinesplitter",
  manaCost: "{2}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "+1/+1",
        amount: { playersWithTurnStat: "damage-taken", who: "each-opponent" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
