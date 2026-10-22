import { defineCard } from "../define.js";

// EDHREC rank 28988.
//
// Rulings:
//   If a creature has a targeted triggered ability that triggers when you
//   exert it, you can exert it even if there isn't a legal target for that
//   triggered ability.
//   Some cards have abilities that trigger whenever you exert any creature.
//   These abilities trigger when you exert that creature or any other
//   creature you control.
//
// Rohirrim Chargers's exert and its "whenever you exert a creature".

const EXERT_TEXT = "You may exert this creature as it attacks.";
const TRIGGER = "Whenever you exert a creature, tap target creature an opponent controls.";

export default defineCard({
  name: "Vizier of the True",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 2,
  text: `${EXERT_TEXT} (It won't untap during your next untap step.)\n${TRIGGER}`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "you-control" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
