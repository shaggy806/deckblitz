import { defineCard } from "../define.js";

// EDHREC rank 5028.
//
// Rulings:
//   [2016-04-08] Relentless Dead's last two abilities trigger at the same time and can be put on
//     the stack in either order. The ability put on the stack first will be the last to resolve.
//   [2016-04-08] You decide whether to pay for each triggered ability as it resolves. If you do,
//     the rest of that ability's effect happens before any player may take actions.
//
// The target is chosen as the ability goes on the stack and X as it resolves,
// so the card comes back only if the X paid is its mana value.
const HAND_TEXT = "When this creature dies, you may pay {B}. If you do, return it to its owner's hand.";
const ZOMBIE_TEXT =
  "When this creature dies, you may pay {X}. If you do, return another target Zombie creature card with mana value X from your graveyard to the battlefield.";

export default defineCard({
  name: "Relentless Dead",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${HAND_TEXT}\n${ZOMBIE_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B} to return Relentless Dead to its owner's hand?",
        cost: "{B}",
        effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      },
      resolve: null,
      text: HAND_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "other",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", subtype: "Zombie" } },
          than: "source",
        },
      ],
      effect: {
        kind: "may",
        prompt: "Pay {X} to return the target Zombie card, if its mana value is X?",
        cost: "{X}",
        effect: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { manaValue: { op: "eq", n: { amount: "x" } } } },
          then: { kind: "put-onto-battlefield", target: 0 },
        },
      },
      resolve: null,
      text: ZOMBIE_TEXT,
    },
  ],
});
