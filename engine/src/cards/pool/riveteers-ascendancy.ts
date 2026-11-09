import { defineCard } from "../define.js";

const TEXT =
  "Whenever you sacrifice a creature, you may return target creature card with lesser mana value from your graveyard to the battlefield tapped. Do this only once each turn.";

// EDHREC rank 4319. Declining doesn't use it up; once a return has happened
// this ability doesn't trigger again this turn (the rulings: `whileCondition`
// on the trigger, the doing marked by `marksAbilityDone`).
export default defineCard({
  name: "Riveteers Ascendancy",
  manaCost: "{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "creature" } },
      whileCondition: { kind: "not", of: { kind: "this-ability-did-this-turn" } },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "lt", n: { amount: { manaValueOf: "trigger-object" } } } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return that creature card to the battlefield tapped? (Only once each turn)",
        oncePerTurn: true,
        effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
