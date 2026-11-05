import { defineCard } from "../define.js";

export default defineCard({
  name: "Power of Persuasion",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Choose target creature an opponent controls, then roll a d20.\n1—9 | Return it to its owner's hand.\n10—19 | Its owner puts it on their choice of the top or bottom of their library.\n20 | Gain control of it until the end of your next turn.",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "roll-dice",
    sides: 20,
    table: [
      { min: 1, max: 9, effect: { kind: "return-to-hand", target: 0 } },
      { min: 10, max: 19, effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } } },
      { min: 20, max: 20, effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, until: "until-end-of-your-next-turn" } },
    ],
  },
});
