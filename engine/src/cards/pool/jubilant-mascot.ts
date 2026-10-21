import { defineCard } from "../define.js";

// Battlebond. EDHREC rank 28528.
//
// Rulings:
//   [2018-06-08] Support can target a creature another player controls.
//   [2018-06-08] You can't put more than one +1/+1 counter on any one target using the support
//     action.
//   [2018-06-08] You choose the target creatures to support when Jubilant Mascot's triggered
//     ability is put onto the stack, but you don't choose whether to pay {3}{W} until the ability
//     resolves.
//
// Aerie Auxiliary's support targets on the trigger, with Matt Murdock's
// "you may pay" asked as it resolves.

const TEXT =
  "At the beginning of combat on your turn, you may pay {3}{W}. If you do, support 2. (Put a +1/+1 counter on each of up to two other target creatures.)";

export default defineCard({
  name: "Jubilant Mascot",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [
        { kind: "optional", of: { kind: "other", of: "creature" } },
        { kind: "optional", of: { kind: "other", of: { kind: "other", of: "creature" }, than: { slots: [0] } } },
      ],
      effect: {
        kind: "may",
        prompt: "Pay {3}{W} to support 2?",
        cost: "{3}{W}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
