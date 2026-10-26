import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, you may have target opponent discard a card at random.";
const DISCARD_TEXT = "Whenever an opponent discards a card, you may create a 1/1 green Elf Warrior creature token.";

export default defineCard({
  name: "Nath of the Gilt-Leaf",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 4,
  toughness: 4,
  text: `${UPKEEP_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "may",
        prompt: "Have target opponent discard a card at random?",
        effect: { kind: "discard", target: 0, amount: 1, random: true },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "discards", who: "opponent", perCard: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 1/1 green Elf Warrior creature token?",
        effect: { kind: "create-token", token: "Elf Warrior Token", count: 1 },
      },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
