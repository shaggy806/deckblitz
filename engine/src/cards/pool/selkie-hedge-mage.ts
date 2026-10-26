import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 27924.
//
// Rulings:
//   Each ability looks at your lands on its own (two dual lands can satisfy both); both are
//   optional, and a targeted one needs a target even if you won't use it. Each has an
//   intervening "if" (rule 603.4): checked as the creature enters and again on resolution.

export default defineCard({
  name: "Selkie Hedge-Mage",
  manaCost: "{2}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, if you control two or more Forests, you may gain 3 life.\nWhen this creature enters, if you control two or more Islands, you may return target tapped creature to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Forest" }, atLeast: 2 },
      targets: [],
      effect: { kind: "may", prompt: "Gain 3 life?", effect: { kind: "gain-life", amount: 3 } },
      resolve: null,
      text: "When this creature enters, if you control two or more Forests, you may gain 3 life.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Island" }, atLeast: 2 },
      targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Return target tapped creature to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: "When this creature enters, if you control two or more Islands, you may return target tapped creature to its owner's hand.",
    },
  ],
});
