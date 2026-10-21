import { defineCard } from "../define.js";

// X in the ultimate is read as it resolves (the ruling).
export default defineCard({
  name: "Ajani, Wise Counselor",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 5,
  text: "+2: You gain 1 life for each creature you control.\n−3: Creatures you control get +2/+2 until end of turn.\n−9: Put X +1/+1 counters on target creature, where X is your life total.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
      resolve: null,
      text: "+2: You gain 1 life for each creature you control.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "−3: Creatures you control get +2/+2 until end of turn.",
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { lifeTotal: "you" } },
      resolve: null,
      text: "−9: Put X +1/+1 counters on target creature, where X is your life total.",
    },
  ],
});
