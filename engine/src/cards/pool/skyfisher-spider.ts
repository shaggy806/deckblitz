import { defineCard } from "../define.js";

export default defineCard({
  name: "Skyfisher Spider",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach\nWhen this creature enters, you may sacrifice another creature. When you do, destroy target nonland permanent.\nWhen this creature dies, you may gain 1 life for each creature card in your graveyard. If you do, exile this card from your graveyard.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["nonland-permanent"],
          effect: { kind: "destroy", target: 0 },
          text: "When you do, destroy target nonland permanent.",
        },
      },
      resolve: null,
      text: "When this creature enters, you may sacrifice another creature. When you do, destroy target nonland permanent.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Gain 1 life for each creature card in your graveyard, then exile Skyfisher Spider?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "gain-life", amount: { countInGraveyard: { type: "creature" } } },
            { kind: "exile", target: "trigger-object" },
          ],
        },
      },
      resolve: null,
      text: "When this creature dies, you may gain 1 life for each creature card in your graveyard. If you do, exile this card from your graveyard.",
    },
  ],
});
