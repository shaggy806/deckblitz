import { defineCard } from "../define.js";

// EDHREC rank 27867. The target opponent chooses from the three revealed cards
// (`chooser: 0`, Karn, Scion of Urza's shape with the opponent targeted); the
// two not chosen stay on top, in their order, so the draw takes them (the
// card's rulings).

const TEXT =
  "{5}, {T}: Reveal the top three cards of your library. Target opponent chooses one of those cards. Put that card into your graveyard, then draw two cards.";

export default defineCard({
  name: "Thran Tome",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 3,
            reveal: true,
            chooser: 0,
            min: 1,
            max: 1,
            destination: "graveyard",
            leftover: "stay",
          },
          { kind: "draw", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
