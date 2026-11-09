import { defineCard } from "../define.js";

// "A creature you cast this turn": it entered this turn as a spell you cast.
const TEXT =
  "Return this enchantment to its owner's hand: Target creature you cast this turn has base power and toughness 0/1 until your next upkeep. At the beginning of your next upkeep, put a +1/+1 counter on that creature.";

export default defineCard({
  name: "Cycle of Life",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, do: { kind: "return-to-hand", target: "source" } },
      targets: [{ kind: "permanent", filter: { type: "creature", castBy: "you", enteredThisTurn: true } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "become",
            target: 0,
            power: 0,
            toughness: 1,
            duration: "until-your-next-upkeep",
          },
          {
            kind: "delayed-trigger",
            at: { step: "upkeep", whose: "you" },
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            text: "At the beginning of your next upkeep, put a +1/+1 counter on that creature.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
