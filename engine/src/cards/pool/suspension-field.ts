import { defineCard } from "../define.js";

// EDHREC rank 21032.
// A target whose toughness has dropped below 3 by resolution is illegal and
// nothing is exiled; a token exiled this way doesn't come back (the rulings).
const ENTER_TEXT =
  "When this enchantment enters, you may exile target creature with toughness 3 or greater until this enchantment leaves the battlefield. (That creature returns under its owner's control.)";

export default defineCard({
  name: "Suspension Field",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", toughness: { op: "gte", n: 3 } } }],
      effect: {
        kind: "may",
        prompt: "Exile the targeted creature until this enchantment leaves the battlefield?",
        effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
