import { defineCard } from "../define.js";

// EDHREC rank 11951.
//
// Rulings:
//   [2023-06-16] You don't choose a target for Old Man Willow's last ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you sacrifice a creature or
//     token this way. You choose a target for that ability as it goes on the stack. Each player
//     may respond to this triggered ability as normal.
//
// The sacrifice is Bolg of the North's `each-player-may` with a reflexive
// trigger; "another creature or a token" is Ice Cream Kitty's one filter over
// both, Willow itself left out.

const PT_TEXT = "Old Man Willow's power and toughness are each equal to the number of lands you control.";
const ATTACK_TEXT =
  "Whenever Old Man Willow attacks, you may sacrifice another creature or a token. When you do, target creature an opponent controls gets -2/-2 until end of turn.";

export default defineCard({
  name: "Old Man Willow",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "land", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { anyOf: [{ type: "creature" }, { token: true }] },
            exceptSource: true,
            text: "Sacrifice another creature or a token",
          },
        ],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["creature-an-opponent-controls"],
          effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
          text: "When you do, target creature an opponent controls gets -2/-2 until end of turn.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
