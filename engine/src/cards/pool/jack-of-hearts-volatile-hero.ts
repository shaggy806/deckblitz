import { defineCard } from "../define.js";
import { powerUp } from "../helpers.js";

// EDHREC rank 25622.
//
// "His power" on the dies trigger is read as Jack of Hearts last existed on
// the battlefield (Flaming Tyrannosaurus's shape), counters included, and he
// deals it to every creature on the battlefield as it resolves.

const DIES_TEXT = "When Jack of Hearts dies, he deals damage equal to his power to each creature.";
const POWER_UP_TEXT =
  "Power-up — {4}{R}{R}: Discard your hand, then draw three cards. Put two +1/+1 counters on Jack of Hearts. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)";

export default defineCard({
  name: "Jack of Hearts, Volatile Hero",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Alien", "Human", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${DIES_TEXT}\n${POWER_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature" }, amount: { powerOf: "source" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    powerUp(
      "{4}{R}{R}",
      {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: 3 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
        ],
      },
      POWER_UP_TEXT,
    ),
  ],
});
