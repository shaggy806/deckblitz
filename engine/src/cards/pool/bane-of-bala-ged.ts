import { defineCard } from "../define.js";

export default defineCard({
  name: "Bane of Bala Ged",
  manaCost: "{7}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 7,
  toughness: 5,
  text: "Whenever this creature attacks, defending player exiles two permanents they control.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        chooser: "that-player",
        filter: { controlledBy: "you" },
        controlledByPlayer: "that-player",
        min: 2,
        upTo: 2,
        then: { kind: "exile", target: 0 },
        prompt: "Exile two permanents you control",
      },
      resolve: null,
      text: "Whenever this creature attacks, defending player exiles two permanents they control.",
    },
  ],
});
