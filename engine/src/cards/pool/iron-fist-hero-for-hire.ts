import { defineCard } from "../define.js";
import { powerUp } from "../helpers.js";

// EDHREC rank 22416.
// Power-up (rule 702.193a) with Skarrgan Hellkite's divided damage: up to
// five targets, the split announced as it's activated, at least 1 each
// (rule 601.2d). With no targets chosen it still puts the five counters on
// Iron Fist; with targets that have all become illegal it does nothing (rule
// 608.2b).

const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const POWER_UP_TEXT =
  "Power-up — {7}{R}: Iron Fist deals 5 damage divided as you choose among up to five targets. Put five +1/+1 counters on Iron Fist. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)";

export default defineCard({
  name: "Iron Fist, Hero for Hire",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${PROWESS_TEXT}\n${POWER_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
  ],
  activated: [
    {
      ...powerUp(
        "{7}{R}",
        {
          kind: "sequence",
          effects: [
            { kind: "damage-divided", from: 0 },
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 5 },
          ],
        },
        POWER_UP_TEXT,
        [{ kind: "any-number", of: "any-target", max: 5 }],
      ),
      divided: { total: 5, slot: 0 },
    },
  ],
});
