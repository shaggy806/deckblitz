import { defineCard } from "../define.js";

export default defineCard({
  name: "Emet-Selch, Unsundered",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Wizard"],
  power: 2,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever Emet-Selch enters or attacks, draw a card, then discard a card.\nAt the beginning of your upkeep, if there are fourteen or more cards in your graveyard, you may transform Emet-Selch.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "Whenever Emet-Selch enters or attacks, draw a card, then discard a card.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "Whenever Emet-Selch enters or attacks, draw a card, then discard a card.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "cards-in-graveyard", atLeast: 14 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Transform Emet-Selch, Unsundered?",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: "At the beginning of your upkeep, if there are fourteen or more cards in your graveyard, you may transform Emet-Selch.",
    },
  ],
  faces: ["Emet-Selch, Unsundered", "Hades, Sorcerer of Eld"],
  transform: true,
});
