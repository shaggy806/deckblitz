import { defineCard } from "../define.js";

// EDHREC rank 7611.
export default defineCard({
  name: "Voidwing Hybrid",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Bat"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  toxic: 1,
  text: "Flying\nToxic 1 (Players dealt combat damage by this creature also get a poison counter.)\nWhen you proliferate, return this card from your graveyard to your hand.",
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "event", event: "proliferates", who: "you" },
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: "When you proliferate, return this card from your graveyard to your hand.",
    },
  ],
});
