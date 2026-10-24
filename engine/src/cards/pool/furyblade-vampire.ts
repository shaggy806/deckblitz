import { defineCard } from "../define.js";

export default defineCard({
  name: "Furyblade Vampire",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Berserker"],
  power: 1,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample\nAt the beginning of combat on your turn, you may discard a card. If you do, this creature gets +3/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to give this creature +3/+0 until end of turn?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
            },
          ],
        },
      },
      resolve: null,
      text: "At the beginning of combat on your turn, you may discard a card. If you do, this creature gets +3/+0 until end of turn.",
    },
  ],
});
