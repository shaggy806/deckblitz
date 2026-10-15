import { defineCard } from "../define.js";

// EDHREC rank 15367.
//
// Rulings:
//   [2025-09-19] Once an ability that causes a creature to connive begins to resolve, no player
//     may take any other actions until it's done.
//   [2025-09-19] If a resolving spell or ability instructs a specific creature to connive but that
//     creature has left the battlefield, the creature still connives. If you discard a nonland
//     card this way, you won't put a +1/+1 counter on anything.
//   [2025-09-19] If no card is discarded, the conniving creature does not receive a +1/+1 counter.

const ETB_TEXT = "When this creature enters, target creature you control connives.";

export default defineCard({
  name: "Mob Lookout",
  manaCost: "{1}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Villain"],
  power: 0,
  toughness: 3,
  text: `${ETB_TEXT} (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "connive", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
