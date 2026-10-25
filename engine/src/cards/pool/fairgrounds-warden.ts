import { defineCard } from "../define.js";

// EDHREC rank 18580. Alabaster Host Intercessor's shape: if this creature has
// left before the trigger resolves, nothing is exiled (the ruling).

const TEXT =
  "When this creature enters, exile target creature an opponent controls until this creature leaves the battlefield.";

export default defineCard({
  name: "Fairgrounds Warden",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Soldier"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
