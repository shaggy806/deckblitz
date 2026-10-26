import { defineCard } from "../define.js";

// EDHREC rank 31330. Mold Demon's shape: an `unless` you answer yourself, offered only
// with two Mountains to sacrifice (rule 118.3).

const ENTER_TEXT = "When this creature enters, sacrifice it unless you sacrifice two Mountains.";

export default defineCard({
  name: "Rathi Dragon",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "land", subtype: "Mountain" }, count: 2, text: "Sacrifice two Mountains" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
