import { defineCard } from "../define.js";
import { powerUp } from "../helpers.js";

// EDHREC rank 17493. Marvel Super Heroes Commander.
//
// Branching Evolution's replacement, and the power-up helper (Aerial
// Doombot) — his own three counters are doubled too.
const DOUBLE_TEXT =
  "If one or more +1/+1 counters would be put on a creature you control, twice that many +1/+1 counters are put on that creature instead.";
const POWER_UP_TEXT =
  "Power-up — {5}{G}{G}: Put three +1/+1 counters on Shang-Chi. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)";

export default defineCard({
  name: "Shang-Chi, Martial Mentor",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 4,
  toughness: 4,
  text: `${DOUBLE_TEXT}\n${POWER_UP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", multiplier: 2, counterKind: "+1/+1", filter: { type: "creature" } },
      text: DOUBLE_TEXT,
    },
  ],
  activated: [
    powerUp("{5}{G}{G}", { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 }, POWER_UP_TEXT),
  ],
});
