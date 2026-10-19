import { defineCard } from "../define.js";

// Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] If a resolving spell or ability instructs a specific creature to connive but that
//     creature has left the battlefield, the creature still connives. If you discard a nonland
//     card this way, you won't put a +1/+1 counter on anything.
//   [2022-04-29] If no card is discarded, most likely because that player's hand is empty and an
//     effect says they can't draw cards, the conniving creature does not receive a +1/+1 counter.
//
// Goldspan Dragon's "becomes the target of a spell", narrowed to a spell
// its controller controls (valiant's `byControllerOnly`), then Atlantean
// Skirmisher's connive.
const TEXT =
  "Whenever this creature becomes the target of a spell you control, it connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)";

export default defineCard({
  name: "Illuminator Virtuoso",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["double-strike"],
  text: `Double strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", spellOnly: true, byControllerOnly: true },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
