import { defineCard } from "../define.js";

// EDHREC rank 30483.
//
// Opal Guardian's shape, the protection's colours read off the spell that
// triggered it as the ability resolves (`colorsOf: "trigger-object"`, as it
// last existed if it has already left the stack). A colourless creature spell
// makes it a 4/4 with protection from nothing.
const TEXT =
  "When an opponent casts a creature spell, if this permanent is an enchantment, it becomes a 4/4 Giant creature with protection from each of that spell's colors.";

export default defineCard({
  name: "Opal Titan",
  manaCost: "{2}{W}{W}",
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
            power: 4,
            toughness: 4,
            setTypes: ["creature"],
            setSubtypes: ["Giant"],
            duration: "permanent",
          },
          { kind: "grant-protection", target: "source", from: { colorsOf: "trigger-object" }, duration: "permanent" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
