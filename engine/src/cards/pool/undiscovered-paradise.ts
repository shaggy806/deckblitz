import { defineCard } from "../define.js";

// EDHREC rank 17294. The return is no trigger (nothing triggers or resolves
// in an untap step, rule 502.4): it rides on the mana ability's `also`, and
// your next untap step does it as you untap (502.3) — even if the land won't
// untap, and only if it's still there (the rulings).

const TEXT =
  "{T}: Add one mana of any color. During your next untap step, as you untap your permanents, return this land to its owner's hand.";

export default defineCard({
  name: "Undiscovered Paradise",
  types: ["land"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: { kind: "return-to-hand-during-next-untap", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
