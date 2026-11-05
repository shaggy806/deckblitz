import { defineCard } from "../define.js";

const EXILE = "{1}{R}{G}, {T}: Exile this creature and target creature without flying that's attacking you.";

export default defineCard({
  name: "Giant Trap Door Spider",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 3,
  text: EXILE,
  activated: [
    {
      cost: { mana: "{1}{R}{G}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying", attackingYou: true } }],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: "source" },
          { kind: "exile", target: 0 },
        ],
      },
      resolve: null,
      text: EXILE,
    },
  ],
});
