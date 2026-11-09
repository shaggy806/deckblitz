import { defineCard } from "../define.js";

const TEXT =
  "When an opponent casts a creature spell, if this permanent is an enchantment, this enchantment becomes a 3/4 Gargoyle creature with flying and protection from red.";

export default defineCard({
  name: "Opal Guardian",
  manaCost: "{W}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "creature" } },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "become",
            target: "source",
            power: 3,
            toughness: 4,
            setTypes: ["creature"],
            setSubtypes: ["Gargoyle"],
            keywords: ["flying"],
            duration: "permanent",
          },
          { kind: "grant-protection", target: "source", from: { colors: ["R"] }, duration: "permanent" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
