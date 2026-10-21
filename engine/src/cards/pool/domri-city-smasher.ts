import { defineCard } from "../define.js";

export default defineCard({
  name: "Domri, City Smasher",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Domri"],
  loyalty: 4,
  text: "+2: Creatures you control get +1/+1 and gain haste until end of turn.\n−3: Domri deals 3 damage to any target.\n−8: Put three +1/+1 counters on each creature you control. Those creatures gain trample until end of turn.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "+2: Creatures you control get +1/+1 and gain haste until end of turn.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "−3: Domri deals 3 damage to any target.",
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 3 },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "−8: Put three +1/+1 counters on each creature you control. Those creatures gain trample until end of turn.",
    },
  ],
});
