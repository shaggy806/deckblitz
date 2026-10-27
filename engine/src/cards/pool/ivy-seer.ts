import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 31660.
//
// Rulings:
//   [2004-10-04] You can reveal zero cards and give +0/+0.
const TEXT =
  "{2}{G}, {T}: Reveal any number of green cards in your hand. Target creature gets +X/+X until end of turn, where X is the number of cards revealed this way.";

export default defineCard({
  name: "Ivy Seer",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: { cardsInHand: "you" },
            filter: { colors: ["G"] },
            destination: "reveal",
            leftover: "stay",
          },
          {
            kind: "modify-pt",
            target: 0,
            power: { thisWay: "revealed", who: "you" },
            toughness: { thisWay: "revealed", who: "you" },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
