import { defineCard } from "../define.js";

// EDHREC rank 11403. Blood Mist's trigger, with "another" target.

const LORD_TEXT =
  "Lord of Chaos — At the beginning of combat on your turn, another target creature you control gains double strike until end of turn.";

export default defineCard({
  name: "Chaos Terminator Lord",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Astartes", "Warrior"],
  power: 3,
  toughness: 3,
  text: LORD_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: LORD_TEXT,
    },
  ],
});
