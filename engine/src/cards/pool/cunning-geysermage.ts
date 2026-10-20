import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, if it was kicked, return up to one other target creature to its owner's hand.";

export default defineCard({
  name: "Cunning Geysermage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  text: `Kicker {2}{U} (You may pay an additional {2}{U} as you cast this spell.)\n${ETB_TEXT}`,
  kicker: { cost: "{2}{U}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
