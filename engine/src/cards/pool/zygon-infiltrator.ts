import { defineCard } from "../define.js";

// It copies the creature's copiable values, not its counters or other effects
// (the rulings), and is what it was again as that creature untaps — a stun counter
// coming off in its place doesn't untap it — or leaves.
const TEXT =
  "Body-print — {2}{U}: Tap another target creature and put a stun counter on it. This creature becomes a copy of that creature for as long as that creature remains tapped. Activate only as a sorcery.";

export default defineCard({
  name: "Zygon Infiltrator",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Alien", "Shapeshifter", "Soldier"],
  power: 3,
  toughness: 2,
  text: `${TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          { kind: "become-copy", target: "source", of: 0, until: { whileTapped: 0 } },
        ],
      },
      sorcerySpeed: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
