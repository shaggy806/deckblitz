import { defineCard } from "../define.js";

// Rulings: with fewer than three cards in your library you can't choose to
// mill (rule 701.17b — `may` isn't offered then); the creature returned may be
// one milled or one already there, and one is returned even if you didn't mill.
export default defineCard({
  name: "Summon Undead",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You may mill three cards. Then return a creature card from your graveyard to the battlefield. (To mill a card, put the top card of your library into your graveyard.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "may", prompt: "Mill three cards?", effect: { kind: "mill", target: "you", amount: 3 } },
      { kind: "return-from-graveyard", filter: { type: "creature" }, destination: "battlefield", count: 1 },
    ],
  },
});
