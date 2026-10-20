import { defineCard } from "../define.js";

// EDHREC rank 7789.
//
// The return happens whichever mode was chosen (the ruling), after it: the
// card isn't targeted but chosen as the spell resolves, so one the mode just
// destroyed can come back. X is the mana from snow sources spent to cast it
// (rule 107.4h) — 0 for a copy, or cast without any.
const RETURN_TEXT =
  "Then return a creature or planeswalker card with mana value X or less from your graveyard to the battlefield, where X is the amount of {S} spent to cast this spell.";
const RETURN = {
  kind: "return-from-graveyard",
  filter: {
    typesAnyOf: ["creature", "planeswalker"],
    manaValue: { op: "lte", n: { amount: { manaSpentOf: "source", from: { supertype: "snow" } } } },
  },
  destination: "battlefield",
  count: 1,
} as const;

export default defineCard({
  name: "Blood on the Snow",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["snow"],
  types: ["sorcery"],
  text: `Choose one —\n• Destroy all creatures.\n• Destroy all planeswalkers.\n${RETURN_TEXT} ({S} is mana from a snow source.)`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy all creatures.",
        effect: { kind: "sequence", effects: [{ kind: "destroy-all", filter: { type: "creature" } }, RETURN] },
      },
      {
        text: "Destroy all planeswalkers.",
        effect: { kind: "sequence", effects: [{ kind: "destroy-all", filter: { type: "planeswalker" } }, RETURN] },
      },
    ],
  },
});
