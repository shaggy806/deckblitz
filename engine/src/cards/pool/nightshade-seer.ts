import { defineCard } from "../define.js";

// EDHREC rank 31588. Scent of Nightshade's effect on an
// ability: the black cards are revealed, and X set, as it resolves; revealing
// none gives -0/-0 (its ruling).

const TEXT =
  "{2}{B}, {T}: Reveal any number of black cards in your hand. Target creature gets -X/-X until end of turn, where X is the number of cards revealed this way.";
const MINUS_X = { product: [{ thisWay: "revealed", who: "you" }, -1] } as const;

export default defineCard({
  name: "Nightshade Seer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true },
      targets: ["creature"],
      resolve: null,
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: { cardsInHand: "you" },
            filter: { colors: ["B"] },
            destination: "reveal",
            leftover: "stay",
          },
          { kind: "modify-pt", target: 0, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
        ],
      },
      text: TEXT,
    },
  ],
});
