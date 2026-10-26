import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 30423.
//
// Rulings:
//   Each ability looks at your lands on its own (two dual lands can satisfy both); both are
//   optional, and a targeted one needs its targets even if you won't use it. Each has an
//   intervening "if" (rule 603.4): checked as the creature enters and again on resolution.
//
// "Two target permanents" is two slots, the second another than the first (Clash of Titans).

export default defineCard({
  name: "Noggle Hedge-Mage",
  manaCost: "{2}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Noggle", "Wizard"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, if you control two or more Islands, you may tap two target permanents.\nWhen this creature enters, if you control two or more Mountains, you may have this creature deal 2 damage to target player or planeswalker.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Island" }, atLeast: 2 },
      targets: ["permanent", { kind: "other", of: "permanent", than: { slot: 0 } }],
      effect: {
        kind: "may",
        prompt: "Tap the two target permanents?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: 0 },
            { kind: "tap", target: 1 },
          ],
        },
      },
      resolve: null,
      text: "When this creature enters, if you control two or more Islands, you may tap two target permanents.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Mountain" }, atLeast: 2 },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "may",
        prompt: "Deal 2 damage to target player or planeswalker?",
        effect: { kind: "damage", amount: 2, target: 0 },
      },
      resolve: null,
      text: "When this creature enters, if you control two or more Mountains, you may have this creature deal 2 damage to target player or planeswalker.",
    },
  ],
});
