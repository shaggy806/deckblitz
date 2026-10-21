import { defineCard } from "../define.js";

// Legends. EDHREC rank 8206.
//
// "If you do": the target must still be an untapped creature you control as
// it resolves (rule 608.2b), or the spell does nothing — so when it resolves,
// the tap always happens and the mana always follows. Its mana value is read
// as it resolves.
export default defineCard({
  name: "Energy Tap",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tap target untapped creature you control. If you do, add an amount of {C} equal to that creature's mana value.",
  targets: [{ kind: "permanent", whose: "you", filter: { tapped: false, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "add-mana", mana: "C", amount: { manaValueOf: 0 } },
    ],
  },
});
