import { defineCard } from "../define.js";

// EDHREC rank 15318.

export default defineCard({
  name: "Michelangelo, On the Scene",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample (This creature can deal excess combat damage to the player it's attacking.)\nMichelangelo enters with a +1/+1 counter on him for each land you control.\nWhen Michelangelo dies, return this card to your hand.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { countOf: { type: "land", controlledBy: "you" } } },
      },
      text: "Michelangelo enters with a +1/+1 counter on him for each land you control.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      resolve: null,
      text: "When Michelangelo dies, return this card to your hand.",
    },
  ],
});
