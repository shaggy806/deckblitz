import { defineCard } from "../define.js";

export default defineCard({
  name: "Kami of the Tended Garden",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  text: "At the beginning of your upkeep, sacrifice this creature unless you pay {G}.\nSoulshift 3 (When this creature dies, you may return target Spirit card with mana value 3 or less from your graveyard to your hand.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{G}", text: "Pay {G}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice this creature unless you pay {G}.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtype: "Spirit", manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: "Soulshift 3 (When this creature dies, you may return target Spirit card with mana value 3 or less from your graveyard to your hand.)",
    },
  ],
});
