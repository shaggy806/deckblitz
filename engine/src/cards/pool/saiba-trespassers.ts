import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 23735.
//
// Rulings:
//   [2022-02-18] If a channel ability requires a target, you may not activate it without a target
//     just to discard the card.
//   [2022-02-18] Discarding the card is part of the cost to activate a channel ability.
//
// Channel (rule 702.51a — `zone: "hand"`, the discard is its cost). "Up to two" lets it go
// with fewer targets; the tap is Juvenile Mist Dragon's `doesntUntapNext`.
const CHANNEL_TEXT =
  "Channel — {3}{U}, Discard this card: Tap up to two target creatures you don't control. Those creatures don't untap during their controller's next untap step.";

export default defineCard({
  name: "Saiba Trespassers",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Moonfolk", "Rogue"],
  power: 3,
  toughness: 5,
  text: CHANNEL_TEXT,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      zone: "hand",
      targets: [
        { kind: "optional", of: "creature-an-opponent-controls" },
        {
          kind: "optional",
          of: { kind: "other", of: "creature-an-opponent-controls", than: { slot: 0 } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0, doesntUntapNext: true },
          { kind: "tap", target: 1, doesntUntapNext: true },
        ],
      },
      resolve: null,
      text: CHANNEL_TEXT,
    },
  ],
});
