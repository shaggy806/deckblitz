import { defineCard } from "../define.js";

const PUMP =
  "{4}{W}, {T}: Creatures you control get +1/+1 until end of turn. This ability costs {2} less to activate if you control a legendary creature.";

export default defineCard({
  name: "Esquire of the King",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: PUMP,
  activated: [
    {
      cost: { mana: "{4}{W}", tap: true },
      costReduction: {
        reduceGeneric: 2,
        condition: { kind: "controls", filter: { type: "creature", supertype: "legendary" }, atLeast: 1 },
      },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP,
    },
  ],
});
