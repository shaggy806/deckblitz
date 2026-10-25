import { defineCard } from "../define.js";

// Two untargeted choices as it resolves (the ruling): a creature card, then a
// land card — each required when there is one, and the other still chosen
// when there isn't.

export default defineCard({
  name: "Sudden Reclamation",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Mill four cards, then return a creature card and a land card from your graveyard to your hand.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 4 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { type: "creature" },
      },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { type: "land" },
      },
    ],
  },
});
