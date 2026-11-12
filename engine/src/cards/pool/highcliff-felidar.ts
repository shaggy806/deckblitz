import { defineCard } from "../define.js";

// EDHREC rank 13928. You choose one creature for each opponent (Tragic
// Arrogance's chooser), then all of them are destroyed at once.

export default defineCard({
  name: "Highcliff Felidar",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen this creature enters, for each opponent, choose a creature with the greatest power among creatures that player controls. Destroy those creatures.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-one-of-each",
        who: "each-opponent",
        slots: ["creature"],
        filter: { type: "creature", greatestAmongItsController: { of: "power", among: { type: "creature" } } },
        chooser: "you",
        chosen: "destroy",
        prompt: "Choose a creature with the greatest power among creatures this player controls — it's destroyed",
      },
      resolve: null,
      text: "When this creature enters, for each opponent, choose a creature with the greatest power among creatures that player controls. Destroy those creatures.",
    },
  ],
});
