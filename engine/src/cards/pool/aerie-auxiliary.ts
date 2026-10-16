import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 18421.
//
// Support N on a permanent: "each of up to N **other** target creatures"
// (rule 701.41a) — any player's, one counter each (Together Forever's shape).
const SUPPORT_TEXT =
  "When this creature enters, support 2. (Put a +1/+1 counter on each of up to two other target creatures.)";

export default defineCard({
  name: "Aerie Auxiliary",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${SUPPORT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(2, { kind: "other", of: "creature" }, { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: SUPPORT_TEXT,
    },
  ],
});
