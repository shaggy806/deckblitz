import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 31419.
// - "Look at the top card" is a look alone: a one-card look-and-choose with
//   nothing to take (Covenant of Minds' max 0), the card staying on top.
// - "Reveal the top card … If it's a land card" is Track Down's reveal-top
//   with the revealed card as target 0; the pump and trample land on the
//   Deceiver itself, only while it's still that permanent.

const LOOK_TEXT = "{1}: Look at the top card of your library.";
const REVEAL_TEXT =
  "{2}: Reveal the top card of your library. If it's a land card, this creature gets +2/+2 and gains trample until end of turn. Activate only once each turn.";

export default defineCard({
  name: "Feral Deceiver",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 2,
  text: `${LOOK_TEXT}\n${REVEAL_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 0,
        destination: "hand",
        leftover: "stay",
      },
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
              { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
              { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
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
