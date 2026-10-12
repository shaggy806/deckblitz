import { defineCard } from "../define.js";

// EDHREC rank 9293.
//
// Rulings:
//   [2025-09-19] If you choose the second mode, you choose whether Heroes' Hangout has one or two
//     targets at the time you cast it. If you choose two targets, each of them get +1/+0 and gain
//     first strike until end of turn.
//   [2025-09-19] For the first mode, you choose which card you'll be allowed to play as the
//     ability resolves. The other card will remain in exile indefinitely.
//   [2025-09-19] You must follow all normal timing rules when playing a land or casting a spell
//     this way.

// Date Night is Tectonic Giant's "exile two, choose one" impulse (the choice
// made as it resolves, the other card left in exile); Patrol Night is Opera
// Love Song's "one or two target creatures".
const DATE_MODE =
  "Date Night — Exile the top two cards of your library. Choose one of them. Until the end of your next turn, you may play that card.";
const PATROL_MODE = "Patrol Night — One or two target creatures each get +1/+0 and gain first strike until end of turn.";

export default defineCard({
  name: "Heroes' Hangout",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Choose one —\n• ${DATE_MODE}\n• ${PATROL_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DATE_MODE,
        targets: [],
        effect: { kind: "impulse-exile", amount: 2, duration: "your-next-turn", choose: 1 },
      },
      {
        text: PATROL_MODE,
        targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
            { kind: "modify-pt", target: 1, power: 1, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 1, keyword: "first-strike", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
