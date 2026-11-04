import { defineCard } from "../define.js";

// EDHREC rank 28130.
//
// Rulings:
//   [2026-08-21] If an effect allows you to cast this card from your graveyard, there need to be
//     seven other cards in your graveyard to cast it.

export default defineCard({
  name: "Proft, Sinister Mastermind",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 5,
  toughness: 5,
  keywords: ["menace"],
  text: "Threshold — You can't cast this spell unless there are seven or more cards in your graveyard.\nMenace\n{B}, Discard this card: Target creature gets -3/-1 until end of turn.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{B}, Discard this card: Target creature gets -3/-1 until end of turn.",
      zone: "hand",
    },
  ],
  // Cast from your graveyard, seven others (the ruling).
  castOnlyIf: { kind: "cards-in-graveyard", atLeast: 7, excludeSelf: true },
});
