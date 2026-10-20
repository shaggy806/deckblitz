import { defineCard } from "../define.js";

// {1} less with any number of Zombies, not {1} per Zombie (the ruling).
export default defineCard({
  name: "Chill of the Grave",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if you control a Zombie.\nTap target creature. It doesn't untap during its controller's next untap step.\nDraw a card.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Zombie" }, atLeast: 1 },
    reduceGeneric: 1,
  },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "draw", amount: 1 },
    ],
  },
});
