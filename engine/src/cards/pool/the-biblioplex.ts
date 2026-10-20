import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Add {C}.";
const LOOK_TEXT =
  "{2}, {T}: Look at the top card of your library. If it's an instant or sorcery card, you may reveal it and put it into your hand. If you don't put the card into your hand, you may put it into your graveyard. Activate only if you have exactly zero or seven cards in hand.";

export default defineCard({
  name: "The Biblioplex",
  colors: [],
  types: ["land"],
  text: `${MANA_TEXT}\n${LOOK_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}", tap: true },
      // Checked only as it's activated (the ruling).
      condition: {
        kind: "any",
        of: [
          { kind: "hand-size", atMost: 0 },
          { kind: "hand-size", atLeast: 7, atMost: 7 },
        ],
      },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["instant", "sorcery"] },
        destination: "hand",
        secondPick: { min: 0, max: 1, destination: "graveyard" },
        leftover: "stay",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
