import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 26076.
//
// Bloodthirst 1 is Bloodrage Vampire's enters-with-counters replacement; the
// evasion is Den Protector's, compared as blockers are declared (the ruling).
//
// Rulings:
//   [2006-02-01] Battering Wurm compares each blocker's power against its own as blockers are
//     being declared.

const BLOODTHIRST =
  "Bloodthirst 1 (If an opponent was dealt damage this turn, this creature enters with a +1/+1 counter on it.)";
const EVADE_TEXT = "Creatures with power less than this creature's power can't block it.";

export default defineCard({
  name: "Battering Wurm",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 4,
  toughness: 3,
  text: `${BLOODTHIRST}\n${EVADE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
            then: 1,
            else: 0,
          },
        },
      },
      text: BLOODTHIRST,
    },
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lt", n: { amount: { powerOf: "source" } } } },
      text: EVADE_TEXT,
    },
  ],
});
