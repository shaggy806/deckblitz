import { defineCard } from "../define.js";

const RETURN =
  "{4}{B}{B}: Return this card from your graveyard to the battlefield with a +1/+1 counter on it. This ability costs {4} less to activate if an opponent controls four or more nonbasic lands.";

export default defineCard({
  name: "Razorlash Transmogrant",
  manaCost: "{2}",
  types: ["artifact", "creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 1,
  text: `This creature can't block.\n${RETURN}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "This creature can't block." }],
  activated: [
    {
      cost: { mana: "{4}{B}{B}", tap: false },
      costReduction: {
        reduceGeneric: 4,
        condition: { kind: "opponent-controls", filter: { type: "land", notSupertype: "basic" }, atLeast: 4 },
      },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "source",
        withCounters: { kind: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
