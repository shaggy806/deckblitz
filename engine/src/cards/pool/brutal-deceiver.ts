import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 31089. "Look at the top card" is a
// look with nothing to take (Covenant of Minds' `max: 0`); the reveal is
// Track Down's `reveal-top` over the revealed card.

const LOOK_TEXT = "{1}: Look at the top card of your library.";
const REVEAL_TEXT =
  "{2}: Reveal the top card of your library. If it's a land card, this creature gets +1/+0 and gains first strike until end of turn. Activate only once each turn.";

export default defineCard({
  name: "Brutal Deceiver",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: `${LOOK_TEXT}\n${REVEAL_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "look-and-choose", zone: "library", count: 1, min: 0, max: 0, destination: "hand", leftover: "stay" },
      resolve: null,
      text: LOOK_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "reveal-top",
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { type: "land" } },
          then: {
            kind: "sequence",
            effects: [
              { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
              { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
            ],
          },
        },
      },
      resolve: null,
      text: REVEAL_TEXT,
      oncePerTurn: true,
    },
  ],
});
