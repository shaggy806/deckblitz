import { defineCard } from "../define.js";

// EDHREC rank 26858.
//
// Rulings:
//   [2023-02-04] You don't choose a target for Ambulatory Edifice's last ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you pay 2 life this way. You
//     choose a target for that ability as it goes on the stack. Each player may respond to this
//     triggered ability as normal.

const ETB_TEXT =
  "When this creature enters, you may pay 2 life. When you do, target creature gets -1/-1 until end of turn.";

export default defineCard({
  name: "Ambulatory Edifice",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 3,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ payLife: 2, text: "Pay 2 life" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
          text: "When you do, target creature gets -1/-1 until end of turn.",
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
