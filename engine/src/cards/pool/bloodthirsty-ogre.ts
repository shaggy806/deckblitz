import { defineCard } from "../define.js";

// Champions of Kamigawa. X is the devotion counters on the Ogre as the
// ability resolves.

export default defineCard({
  name: "Bloodthirsty Ogre",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior", "Shaman"],
  power: 3,
  toughness: 1,
  text: "{T}: Put a devotion counter on this creature.\n{T}: Target creature gets -X/-X until end of turn, where X is the number of devotion counters on this creature. Activate only if you control a Demon.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "devotion", amount: 1 },
      resolve: null,
      text: "{T}: Put a devotion counter on this creature.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: [{ countersOn: "source", counter: "devotion" }, -1] },
        toughness: { product: [{ countersOn: "source", counter: "devotion" }, -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      condition: { kind: "controls", filter: { subtype: "Demon" }, atLeast: 1 },
      text: "{T}: Target creature gets -X/-X until end of turn, where X is the number of devotion counters on this creature. Activate only if you control a Demon.",
    },
  ],
});
