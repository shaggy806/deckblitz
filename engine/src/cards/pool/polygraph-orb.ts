import { defineCard } from "../define.js";

// Murders at Karlov Manor. Each opponent chooses in turn order, then all the
// actions happen at once, a discarded card unrevealed until then (rule
// 101.4, its ruling).
const ENTERS_TEXT =
  "When this artifact enters, look at the top four cards of your library. Put two of them into your hand and the rest into your graveyard. You lose 2 life.";
const ACTIVATED_TEXT =
  "{2}, {T}, Collect evidence 3: Each opponent loses 3 life unless they discard a card or sacrifice a creature.";

export default defineCard({
  name: "Polygraph Orb",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: `${ENTERS_TEXT}\n${ACTIVATED_TEXT} (To collect evidence 3, exile cards with total mana value 3 or greater from your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 4,
            min: 2,
            max: 2,
            destination: "hand",
            leftover: "graveyard",
          },
          { kind: "lose-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, collectEvidence: 3 },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [
          { discard: 1, text: "Discard a card" },
          { sacrifice: { type: "creature" }, text: "Sacrifice a creature" },
        ],
        ifDidnt: { kind: "lose-life", amount: 3, who: "that-player" },
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
