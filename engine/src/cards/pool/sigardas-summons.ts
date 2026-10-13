import { defineCard } from "../define.js";

// EDHREC rank 6991.
//
// Rulings:
//   [2021-11-19] Removing all +1/+1 counters from a creature affected by this ability or removing
//     Sigarda's Summons from the battlefield will cause that creature to revert back to what it
//     was. Notably, this may cause a creature to lose flying after it has been declared as an
//     attacker but before blockers are declared. This may also result in a creature with damage
//     already marked on it being destroyed if that damage is greater than the creature's
//     toughness.
//
// One static over the creatures that have a +1/+1 counter as it's read
// (Badgermole's filter): base 4/4 in layer 7b, so counters and pumps apply on
// top, the Angel type in layer 4 and flying in 6 (Kudo, King Among Bears'
// shape). A creature whose counters are removed reverts (the ruling).
const TEXT =
  "Creatures you control with +1/+1 counters on them have base power and toughness 4/4, have flying, and are Angels in addition to their other types.";

export default defineCard({
  name: "Sigarda's Summons",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["flying"],
      addSubtypes: ["Angel"],
      text: TEXT,
    },
  ],
});
