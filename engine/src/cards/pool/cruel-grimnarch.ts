import { defineCard } from "../define.js";

const TRIGGER = "When this creature enters, each opponent discards a card. For each opponent who can't, you gain 4 life.";

export default defineCard({
  name: "Cruel Grimnarch",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 5,
  toughness: 5,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        whoIf: { kind: "of-player", player: "that-player", condition: { kind: "hand-size", atMost: 0 } },
        before: { kind: "discard", target: "each-opponent", amount: 1 },
        effect: { kind: "gain-life", amount: 4 },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
