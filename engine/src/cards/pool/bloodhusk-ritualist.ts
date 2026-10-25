import { defineCard } from "../define.js";

// Worldwake (WWK).

const ENTER_TEXT = "When this creature enters, target opponent discards a card for each time it was kicked.";

export default defineCard({
  name: "Bloodhusk Ritualist",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Shaman"],
  power: 2,
  toughness: 2,
  text: `Multikicker {B} (You may pay an additional {B} any number of times as you cast this spell.)\n${ENTER_TEXT}`,
  kicker: { cost: "{B}", multi: true },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard", target: 0, amount: { timesKicked: "source" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
