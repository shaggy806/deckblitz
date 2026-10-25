import { defineCard } from "../define.js";

// Worldwake (WWK). The target is chosen even when it wasn't kicked (the
// trigger has no "if"), and then takes 0.

const ENTER_TEXT =
  "When this creature enters, it deals damage to target player or planeswalker equal to twice the number of times it was kicked.";

export default defineCard({
  name: "Deathforge Shaman",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Shaman"],
  power: 4,
  toughness: 3,
  text: `Multikicker {R} (You may pay an additional {R} any number of times as you cast this spell.)\n${ENTER_TEXT}`,
  kicker: { cost: "{R}", multi: true },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: { product: [2, { timesKicked: "source" }] }, target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
