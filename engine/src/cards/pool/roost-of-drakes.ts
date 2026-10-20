import { defineCard } from "../define.js";

// Its own kicked cast doesn't trigger its last ability: it isn't on the
// battlefield yet as it's cast.

const ENTER_TEXT = "When this enchantment enters, if it was kicked, create a 2/2 blue Drake creature token with flying.";
const CAST_TEXT = "Whenever you cast a kicked spell, create a 2/2 blue Drake creature token with flying.";

export default defineCard({
  name: "Roost of Drakes",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `Kicker {2}{U} (You may pay an additional {2}{U} as you cast this spell.)\n${ENTER_TEXT}\n${CAST_TEXT}`,
  kicker: { cost: "{2}{U}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: { kind: "create-token", token: "Drake Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { kicked: true } },
      targets: [],
      effect: { kind: "create-token", token: "Drake Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
