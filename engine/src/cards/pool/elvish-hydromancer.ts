import { defineCard } from "../define.js";

// Ruling (2022-09-09): kicked, it may target itself; the token copy wasn't
// kicked, so its own ability doesn't trigger again.
const ETB_TEXT =
  "When this creature enters, if it was kicked, create a token that's a copy of target creature you control.";

export default defineCard({
  name: "Elvish Hydromancer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 3,
  toughness: 2,
  text: `Kicker {3}{U} (You may pay an additional {3}{U} as you cast this spell.)\n${ETB_TEXT}`,
  kicker: { cost: "{3}{U}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: ["creature-you-control"],
      effect: { kind: "create-token-copy", of: 0, count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
