import { defineCard } from "../define.js";
import { powerUp } from "../helpers.js";

// EDHREC rank 19089.
//
// "Can't be blocked" is Tetsuko Umezawa's `cantBeBlockedBy` any creature,
// read as a block is checked, so the "power 1 or less" condition reads her
// power then — which the layer fold that computes it couldn't ask of itself.
// Once she's unblocked, growing doesn't change that. Her power-up's {X} is 0
// for the "entered this turn" reduction, which takes off a {U} (rule 702.193b).
const EVASION_TEXT = "Stature can't be blocked if her power is 1 or less.";
const POWER_UP_TEXT =
  "Power-up — {X}{U}{U}: Put X +1/+1 counters on Stature. (Activate each power-up ability only once. Reduce the " +
  "cost by her mana cost if she entered this turn.)";

export default defineCard({
  name: "Stature, Size Shifter",
  manaCost: "{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 1,
  toughness: 1,
  text: `${EVASION_TEXT}\n${POWER_UP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { power: { op: "lte", n: 1 } } },
      cantBeBlockedBy: {},
      text: EVASION_TEXT,
    },
  ],
  activated: [
    powerUp("{X}{U}{U}", { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" }, POWER_UP_TEXT),
  ],
});
