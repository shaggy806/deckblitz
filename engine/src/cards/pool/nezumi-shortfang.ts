import { defineCard } from "../define.js";

const TEXT = "{1}{B}, {T}: Target opponent discards a card. Then if that player has no cards in hand, flip this creature.";

export default defineCard({
  name: "Nezumi Shortfang",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Rogue"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: 0, amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "of-player", player: { target: 0 }, condition: { kind: "hand-size", atMost: 0 } },
            then: { kind: "flip", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Nezumi Shortfang", "Stabwhisker the Odious"],
  flip: true,
});
