import { defineCard } from "../define.js";

export default defineCard({
  name: "Synod Artificer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Artificer"],
  power: 1,
  toughness: 2,
  text: "{X}, {T}: Tap X target noncreature artifacts.\n{X}, {T}: Untap X target noncreature artifacts.",
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [
        {
          kind: "any-number",
          of: { kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } },
          min: "x",
          max: "x",
        },
      ],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
      resolve: null,
      text: "{X}, {T}: Tap X target noncreature artifacts.",
    },
    {
      cost: { mana: "{X}", tap: true },
      targets: [
        {
          kind: "any-number",
          of: { kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } },
          min: "x",
          max: "x",
        },
      ],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "untap", target: 0 } },
      resolve: null,
      text: "{X}, {T}: Untap X target noncreature artifacts.",
    },
  ],
});
