import { defineCard } from "../define.js";

// EDHREC rank 13340.
//
// "If that land is an Island" is read as the trigger resolves (the land as it
// last was, if it has left). An already tapped creature may be the target; it
// still doesn't untap (the ruling) — `doesntUntapNext` applies either way.
const TEXT =
  "Landfall — Whenever a land you control enters, tap target creature an opponent controls. If that land is an Island, that creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Guardian of Tazeem",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { subtype: "Island" } },
        then: { kind: "tap", target: 0, doesntUntapNext: true },
        else: { kind: "tap", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
