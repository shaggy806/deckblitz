import { defineCard } from "../define.js";

// EDHREC rank 13582.
//
// Not targeted: the distribution is chosen as the trigger resolves (rule
// 608.2d — its ruling). The Hydra, still the permanent that entered (rule
// 400.7), always gets at least one; the rest go among any number of
// commanders on the battlefield, anyone's, creature or not (its rulings).
// With the Hydra gone, any number of commanders, none included.

const TEXT = "When this creature enters, distribute X +1/+1 counters among it and any number of commanders.";

export default defineCard({
  name: "Stumpsquall Hydra",
  manaCost: "{X}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "counters-distributed",
        counter: "+1/+1",
        total: "x",
        filter: { isCommander: true, isSource: false },
        withSource: true,
        among: "commanders",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
