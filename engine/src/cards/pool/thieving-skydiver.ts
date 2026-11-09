import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, if it was kicked, gain control of target artifact with mana value X or less. If that artifact is an Equipment, attach it to this creature.";

// EDHREC rank 2429.
export default defineCard({
  name: "Thieving Skydiver",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  kicker: { cost: "{X}", minX: 1 },
  text: `Kicker {X}. X can't be 0. (You may pay an additional {X} as you cast this spell.)\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [{ kind: "permanent", filter: { type: "artifact", manaValue: { op: "lte", n: "x" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { subtype: "Equipment" } },
            then: { kind: "attach", attachment: 0, target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
