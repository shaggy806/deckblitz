import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, if you control two or more Gates, gain control of target creature an opponent controls until end of turn. Untap that creature. It gains haste until end of turn.";

export default defineCard({
  name: "Smelt-Ward Gatekeepers",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 2 },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
