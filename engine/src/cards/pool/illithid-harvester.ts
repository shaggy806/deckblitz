import { defineCard } from "../define.js";

// EDHREC rank 7262. Each target still tapped and nontoken as the trigger
// resolves is turned face down in place (rule 708.2a) with the characteristics
// the effect lists (708.2): a colourless 2/2 Horror creature with no name, text
// or mana cost, the same permanent, still tapped. Turned face down by an
// effect, it's turned face up only by its own morph or disguise cost
// (702.37e); a double-faced creature isn't turned face down at all (712.16).

const TEXT =
  "Ceremorphosis — When this creature enters, turn any number of target tapped nontoken creatures face down. They're 2/2 Horror creatures.";

export default defineCard({
  name: "Illithid Harvester",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "permanent", filter: { type: "creature", tapped: true, token: false } } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "turn-face-down", target: 0, as: "2/2 Horror creature" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Illithid Harvester", "Plant Tadpoles"],
  adventure: true,
});
