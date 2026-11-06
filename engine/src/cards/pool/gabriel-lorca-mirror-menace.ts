import { defineCard } from "../define.js";

// EDHREC rank 32457.

export default defineCard({
  name: "Gabriel Lorca, Mirror Menace",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Officer"],
  power: 5,
  toughness: 4,
  keywords: ["menace"],
  text: "Menace\nWhenever you face a dilemma, you may pay {B}. If you do, return this card from your graveyard to your hand. (You face a dilemma as you choose one or more modes for a spell or ability.)",
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "faces-dilemma", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B} to return Gabriel Lorca to your hand?",
        cost: "{B}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: "Whenever you face a dilemma, you may pay {B}. If you do, return this card from your graveyard to your hand.",
    },
  ],
});
