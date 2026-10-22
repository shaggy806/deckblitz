import { defineCard } from "../define.js";

// EDHREC rank 11935. Fallen Empires.
// Which counter is chosen as the ability resolves (a `modal` effect over the
// ability's one target — Brightling's shape); the target is chosen on activation.

const TEXT = "{R}, {T}, Discard a card: Put a +0/+1 counter or a +1/+0 counter on target creature.";

export default defineCard({
  name: "Dwarven Armorer",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 0,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Put a +0/+1 counter on target creature.", effect: { kind: "add-counter", target: 0, counter: "+0/+1", amount: 1 } },
          { text: "Put a +1/+0 counter on target creature.", effect: { kind: "add-counter", target: 0, counter: "+1/+0", amount: 1 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
