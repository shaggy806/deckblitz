import { defineCard } from "../define.js";

const ETB_TEXT = "When Elektra enters, destroy target creature an opponent controls with power 3 or less.";

export default defineCard({
  name: "Elektra, Daughter of the Hand",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ninja", "Villain"],
  power: 3,
  toughness: 3,
  sneak: { cost: "{1}{B}{B}" },
  text:
    "Sneak {1}{B}{B} (You may cast this spell for {1}{B}{B} if you also return an unblocked attacker you control to hand during the declare blockers step. She enters tapped and attacking.)\n" +
    ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", power: { op: "lte", n: 3 } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
