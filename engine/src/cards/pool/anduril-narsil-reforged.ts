import { defineCard } from "../define.js";

// Top-5000 #2584. Not an intervening if: the trigger fires either way and
// the blessing is read as it resolves.

const TEXT =
  "Whenever equipped creature attacks, put a +1/+1 counter on each creature you control. If you have the city's blessing, put two +1/+1 counters on each creature you control instead.";

export default defineCard({
  name: "Andúril, Narsil Reforged",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["ascend"],
  text: `Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n${TEXT}\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "citys-blessing" },
        then: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 2 },
        else: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
});
