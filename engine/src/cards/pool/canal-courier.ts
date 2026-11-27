import { defineCard } from "../define.js";

// EDHREC rank 24623.
//
// Rulings:
//   Attacking a planeswalker isn't the same thing as attacking a player. Both
//   Canal Courier and the other creature must attack different players for
//   the last ability to trigger.
//
// The `attacks` trigger's `anotherAttacksDifferentPlayer`, read as the
// declaration's triggers are; "can't be blocked this combat" is Yuan Shao's
// Infantry's restriction until end of combat.
const MONARCH_TEXT = "When this creature enters, you become the monarch.";
const ATTACK_TEXT =
  "Whenever this creature and another creature attack different players, this creature can't be blocked this combat.";

export default defineCard({
  name: "Canal Courier",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 5,
  text: `${MONARCH_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self", anotherAttacksDifferentPlayer: true },
      targets: [],
      effect: { kind: "restrict", target: "source", restrictions: ["cant-be-blocked"], duration: "until-end-of-combat" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
