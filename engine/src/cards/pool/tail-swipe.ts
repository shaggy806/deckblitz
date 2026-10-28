import { defineCard } from "../define.js";

// EDHREC rank 4219. Joust's shape with Might of Old Krosa's "if you cast this
// spell during your main phase" (a copy wasn't cast, so it gets no +1/+1).

export default defineCard({
  name: "Tail Swipe",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose target creature you control and target creature you don't control. If you cast this spell during your main phase, the creature you control gets +1/+1 until end of turn. Then those creatures fight each other. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source", filter: { cast: true } },
            { kind: "your-turn" },
            { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
          ],
        },
        then: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
