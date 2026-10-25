import { defineCard } from "../define.js";

// EDHREC rank 20422. Devoid: colourless (`colors: []`).
//
// The exile replacement is on the opponent's creature for the turn whatever
// the fight did — even if your creature became an illegal target and no
// fight happened (the rulings).

export default defineCard({
  name: "Unnatural Aggression",
  manaCost: "{2}{G}",
  colors: [],
  types: ["instant"],
  text: "Devoid (This card has no color.)\nTarget creature you control fights target creature an opponent controls. If the creature an opponent controls would die this turn, exile it instead.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "fight", a: 0, b: 1 },
      { kind: "exile-if-dies-this-turn", target: 1 },
    ],
  },
});
