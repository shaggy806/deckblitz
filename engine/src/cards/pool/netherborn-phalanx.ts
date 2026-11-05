import { defineCard } from "../define.js";
import { transmute } from "../helpers.js";

// EDHREC rank 15975. Counted from each opponent's own side, once for each.

const TRIGGER_TEXT = "When this creature enters, each opponent loses 1 life for each creature they control.";
const TRANSMUTE_TEXT =
  "Transmute {1}{B}{B} ({1}{B}{B}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)";

export default defineCard({
  name: "Netherborn Phalanx",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 2,
  toughness: 4,
  text: `${TRIGGER_TEXT}\n${TRANSMUTE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "lose-life",
        who: "each-opponent",
        amount: { countOf: { type: "creature", controlledBy: "you" }, forEachPlayer: true },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [transmute("{1}{B}{B}", 6, TRANSMUTE_TEXT)],
});
