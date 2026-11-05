import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, target player reveals a number of cards from their hand equal to your devotion to black. You choose one of them. That player discards that card. (Each {B} in the mana costs of permanents you control counts toward your devotion to black.)";

export default defineCard({
  name: "Disciple of Phenax",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "discard-chosen", target: 0, reveals: { devotionTo: "B" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
