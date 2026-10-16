import { defineCard } from "../define.js";

// EDHREC rank 11696. Reassembling Skeleton's graveyard return, with the two
// counters it enters with.
const TEXT =
  "{3}{B}: Return this card from your graveyard to the battlefield tapped with two +1/+1 counters on it.";

export default defineCard({
  name: "Retrofitted Transmogrant",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "source",
        enterTapped: true,
        withCounters: { kind: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
