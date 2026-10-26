import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 26706.
//
// Bloodthirst 1 as Bloodrage Vampire has it; the blocking restriction is Aura
// Gnarlid's, each blocker's power compared as blockers are declared.

const BLOODTHIRST =
  "Bloodthirst 1 (If an opponent was dealt damage this turn, this creature enters with a +1/+1 counter on it.)";
const EVASION = "Creatures with power less than this creature's power can't block it.";

export default defineCard({
  name: "Skarrgan Pit-Skulk",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  text: `${BLOODTHIRST}\n${EVASION}`,
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
      text: EVASION,
    },
  ],
});
