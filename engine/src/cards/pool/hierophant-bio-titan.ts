import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// - Frenzied Metabolism: how many counters is announced as the spell is cast (rule 601.2b), each
//   taking {2} off the total cost's generic part, never {G}{G} (601.2f; the ruling); which
//   creatures give them is chosen as the cost is paid (601.2h, the `remove-counters` decision).
//   Any number may go, even past what lowers the cost further (the ruling). Not an {X} in its mana
//   cost: its mana value stays 12.
// - Once blocked by a creature with power 3 or greater, lowering that power doesn't unblock it
//   (the ruling): a block restriction is checked as blockers are declared only.

const FRENZIED =
  "Frenzied Metabolism — As an additional cost to cast this spell, you may remove any number of +1/+1 counters from among creatures you control. This spell costs {2} less to cast for each counter removed this way.";
const TITANIC = "Titanic — This creature can't be blocked by creatures with power 2 or less.";

export default defineCard({
  name: "Hierophant Bio-Titan",
  manaCost: "{10}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 12,
  toughness: 12,
  keywords: ["reach", "vigilance"],
  text: `${FRENZIED}\nReach, vigilance, ward {2}\n${TITANIC}`,
  additionalCost: {
    also: {
      text: "Remove any number of +1/+1 counters from among creatures you control",
      do: { kind: "remove-counters", from: { type: "creature" }, counter: "+1/+1", count: "x", among: true },
    },
    reducesPerX: 2,
  },
  triggered: [ward({ mana: "{2}" })],
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { power: { op: "lte", n: 2 } } }],
      text: TITANIC,
    },
  ],
});
