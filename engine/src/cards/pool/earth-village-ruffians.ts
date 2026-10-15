import { defineCard } from "../define.js";

// EDHREC rank 20645. Badgermole's earthbend 2, on dying.

const DIES_TEXT = "When this creature dies, earthbend 2.";

export default defineCard({
  name: "Earth Village Ruffians",
  manaCost: "{2}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Rogue"],
  power: 3,
  toughness: 1,
  text: `${DIES_TEXT} (Target land you control becomes a 0/0 creature with haste that's still a land. Put two +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["land-you-control"],
      effect: { kind: "earthbend", target: 0, amount: 2 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
