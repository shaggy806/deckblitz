import { defineCard } from "../define.js";

// EDHREC rank 5067.
//
// Rulings:
//   [2023-04-14] If Valkyrie's Call goes to the graveyard at the same time as one or more
//     nontoken, non-Angel creatures you control die, its ability triggers once for each of those
//     creatures.
//
// The card is an Angel with flying as it enters (`enterAs`), for as long as it
// stays on the battlefield, so its own death doesn't bring it back again.
const TEXT =
  "Whenever a nontoken, non-Angel creature you control dies, return that card to the battlefield under its owner's control with a +1/+1 counter on it. It has flying and is an Angel in addition to its other types.";

export default defineCard({
  name: "Valkyrie's Call",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", token: false, notSubtypes: ["Angel"] },
      },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        withCounters: { kind: "+1/+1", amount: 1 },
        enterAs: { addSubtypes: ["Angel"], keywords: ["flying"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
