import { defineCard } from "../define.js";

const TEXT =
  "{3}, {T}: Tap target creature. Gain control of that creature instead if you control artifacts named Scepter of Empires and Throne of Empires.";

// Whether you control both is read as the ability resolves; with both, the
// creature isn't tapped, only taken (its rulings).
export default defineCard({
  name: "Crown of Empires",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "controls", filter: { type: "artifact", name: "Scepter of Empires" }, atLeast: 1 },
            { kind: "controls", filter: { type: "artifact", name: "Throne of Empires" }, atLeast: 1 },
          ],
        },
        then: { kind: "gain-control", target: 0, untilEndOfTurn: false },
        else: { kind: "tap", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
