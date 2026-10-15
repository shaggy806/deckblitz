import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 15470.
//
// - "Your commander" is a commander you own, whoever controls it — Tome of
//   Legends' filter, on an enters and an attacks trigger.
// - The dig is Boromir, Gondor's Hope's, for a legendary creature card.
const TEXT =
  "Whenever your commander enters or attacks, look at the top six cards of your library. You may reveal a legendary " +
  "creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

const YOUR_COMMANDER = { isCommander: true, ownedBy: "you" } as const;

const DIG: EffectSpec = {
  kind: "look-and-choose",
  zone: "library",
  count: 6,
  reveal: "chosen",
  min: 0,
  max: 1,
  filter: { type: "creature", supertype: "legendary" },
  destination: "hand",
  leftover: "bottom-random",
};

export default defineCard({
  name: "Search for Dagger",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: YOUR_COMMANDER },
      targets: [],
      effect: DIG,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "any", filter: YOUR_COMMANDER },
      targets: [],
      effect: DIG,
      resolve: null,
      text: TEXT,
    },
  ],
});
