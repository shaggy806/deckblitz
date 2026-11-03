import { defineCard } from "../define.js";

// Rulings:
//   [2016-09-20] Once Madcap Experiment begins resolving, no player may take any actions other than
//     those specified by Madcap Experiment until it's done resolving.
//   [2016-09-20] Any abilities that trigger as the artifact enters the battlefield aren't put onto
//     the stack until Madcap Experiment is done resolving.
//   [2016-09-20] The number of cards revealed this way includes the artifact card you put onto the
//     battlefield.
//   [2016-09-20] If you don't reveal an artifact card, you'll randomize your library and be dealt
//     damage equal to the number of cards in your library.
export default defineCard({
  name: "Madcap Experiment",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Reveal cards from the top of your library until you reveal an artifact card. Put that card onto the battlefield and the rest on the bottom of your library in a random order. Madcap Experiment deals damage to you equal to the number of cards revealed this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-until", filter: { type: "artifact" }, put: "battlefield", rest: "bottom-random" },
      { kind: "damage", amount: { thisWay: "revealed" }, who: "you" },
    ],
  },
});
