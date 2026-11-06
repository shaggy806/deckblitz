import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const CHARGE_TEXT = "{2}, {T}: Put two charge counters on target artifact.";
const UNBLOCKABLE_TEXT = "{3}, {T}: Target creature you control can't be blocked this turn.";
const DRAW_TEXT = "{4}, {T}: Draw a card. You may put a land card from your hand onto the battlefield tapped.";

export default defineCard({
  name: "Jefferies Tube",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${CHARGE_TEXT}\n${UNBLOCKABLE_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["artifact"],
      effect: { kind: "add-counter", target: 0, counter: "charge", amount: 2 },
      resolve: null,
      text: CHARGE_TEXT,
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            enterTapped: true,
            leftover: "stay",
            filter: { type: "land" },
          },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
