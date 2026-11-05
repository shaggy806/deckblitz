import { defineCard } from "../define.js";

const TEXT =
  "Whenever a source of the chosen color deals damage to you, you may pay {1}. If you do, target player loses 1 life and you gain 1 life.";

// Any source — a spell too — of the colour chosen as it entered
// (`ofChosenColor`); one trigger per source, and one {1} each time however much
// damage was dealt (the rulings).
export default defineCard({
  name: "Circle of Affliction",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  text: `As this enchantment enters, choose a color.\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", to: "you", filter: { ofChosenColor: true } },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Pay {1}: target player loses 1 life and you gain 1 life?",
        cost: "{1}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 1, target: 0 },
            { kind: "gain-life", amount: 1, who: "you" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
