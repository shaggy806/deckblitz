import { defineCard } from "../define.js";

// EDHREC rank 15673.
//
// The count is read after the mill, as the -1/-1 applies (the sequence's
// second step), so the milled lands count.

const MINUS_LANDS = { product: [{ countInGraveyard: { type: "land", ownedBy: "you" } }, -1] } as const;

export default defineCard({
  name: "Drown in Filth",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Choose target creature. Mill four cards, then that creature gets -1/-1 until end of turn for each land card in your graveyard.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 4 },
      { kind: "modify-pt", target: 0, power: MINUS_LANDS, toughness: MINUS_LANDS, duration: "end-of-turn" },
    ],
  },
});
