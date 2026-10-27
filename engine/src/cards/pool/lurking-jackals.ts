import { defineCard } from "../define.js";

// Rulings:
//   Once it becomes a creature, it will not change back into an enchantment if
//     your opponent's life total goes back above 10.
//   Once it becomes a creature, it is no longer an enchantment.
//
// Opal Avenger's shape, with the state trigger watching an opponent's life.

const TEXT =
  "When an opponent has 10 or less life, if this permanent is an enchantment, it becomes a 3/2 Jackal creature.";

export default defineCard({
  name: "Lurking Jackals",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "state", state: { kind: "life-total", who: "opponent", atMost: 10 } },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 2,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Jackal"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
