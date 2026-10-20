import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2). The damage reads its power as the trigger
// resolves, as it last existed if it has left (the first ruling).
const ENTER_TEXT = "This creature enters with a +1/+1 counter on it for each time it was kicked.";
const DAMAGE_TEXT = "When this creature enters, it deals damage equal to its power to target creature.";

export default defineCard({
  name: "Flametongue Yearling",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 2,
  toughness: 1,
  text: `Multikicker {2} (You may pay an additional {2} any number of times as you cast this spell.)\n${ENTER_TEXT}\n${DAMAGE_TEXT}`,
  kicker: { cost: "{2}", multi: true },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "times-kicked" } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
