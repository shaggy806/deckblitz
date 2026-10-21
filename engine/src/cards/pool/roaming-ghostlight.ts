import { defineCard } from "../define.js";

export default defineCard({
  name: "Roaming Ghostlight",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, return up to one target non-Spirit creature to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", whose: "any", filter: { type: "creature", notSubtypes: ["Spirit"] } },
        },
      ],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "When this creature enters, return up to one target non-Spirit creature to its owner's hand.",
    },
  ],
});
