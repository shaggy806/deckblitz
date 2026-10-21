import { defineCard } from "../define.js";

// EDHREC rank 22431. Batched: one +1/+1 however many cards arrive at once
// (the ruling).

export default defineCard({
  name: "Devourer of Memory",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 2,
  toughness: 1,
  text: "Whenever one or more cards are put into your graveyard from your library, this creature gets +1/+1 until end of turn and can't be blocked this turn.\n{1}{U}{B}: Mill a card.",
  activated: [
    {
      cost: { mana: "{1}{U}{B}", tap: false },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 1 },
      resolve: null,
      text: "{1}{U}{B}: Mill a card.",
    },
  ],
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "you", from: "library", batched: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever one or more cards are put into your graveyard from your library, this creature gets +1/+1 until end of turn and can't be blocked this turn.",
    },
  ],
});
