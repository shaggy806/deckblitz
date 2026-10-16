import { defineCard } from "../define.js";

// EDHREC rank 18999. Rabid Gnaw's shape: the pump, then a one-sided fight.
// "Instead if it's a Mount" is asked of the creature as the spell resolves.
// Ruling: both targets are required to cast it.
export default defineCard({
  name: "Throw from the Saddle",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control gets +1/+1 until end of turn. Put a +1/+1 counter on it instead if it's a Mount. Then it deals damage equal to its power to target creature you don't control.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Mount" } },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        else: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
