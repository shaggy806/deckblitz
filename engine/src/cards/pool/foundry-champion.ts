import { defineCard } from "../define.js";

// EDHREC rank 22406.
//
// Rulings:
//   [2013-01-24] The number of creatures you control is counted when Foundry Champion's triggered
//     ability resolves. Foundry Champion will count itself if it's still on the battlefield under
//     your control at that time.

export default defineCard({
  name: "Foundry Champion",
  manaCost: "{4}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Soldier"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, it deals damage to any target equal to the number of creatures you control.\n{R}: This creature gets +1/+0 until end of turn.\n{W}: This creature gets +0/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{W}: This creature gets +0/+1 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      // Counted as it resolves, itself included if it's still there (the ruling).
      effect: { kind: "damage", target: 0, amount: { countOf: { type: "creature", controlledBy: "you" } } },
      resolve: null,
      text: "When this creature enters, it deals damage to any target equal to the number of creatures you control.",
    },
  ],
});
