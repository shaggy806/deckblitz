import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 26121. Ruling: whether to tap or untap
// (or neither) is chosen as the ability resolves — a resolution-time modal.

const TEXT = "Whenever you cast a Spirit or Arcane spell, you may tap or untap target creature.";

export default defineCard({
  name: "Teller of Tales",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: ["creature"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
