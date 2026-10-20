import { defineCard } from "../define.js";

// EDHREC rank 13178. Screaming Swarm's graveyard ability, third from the top
// (with fewer than two cards in the library, it goes to the bottom — the
// ruling).

export default defineCard({
  name: "Bookwurm",
  manaCost: "{7}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, you gain 3 life and draw a card.\n{2}{G}: Put this card from your graveyard into your library third from the top.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-on-library", target: "source", position: { fromTop: 3 } },
      resolve: null,
      text: "{2}{G}: Put this card from your graveyard into your library third from the top.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "When this creature enters, you gain 3 life and draw a card.",
    },
  ],
});
