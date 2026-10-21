import { defineCard } from "../define.js";

// Read the Tides' shape at three slots, any mix of creatures and
// enchantments, returned as one event.
export default defineCard({
  name: "Sea God's Scorn",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return up to three target creatures and/or enchantments to their owners' hands.",
  targets: [
    { kind: "optional", of: "creature-or-enchantment" },
    { kind: "optional", of: { kind: "other", of: "creature-or-enchantment", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "creature-or-enchantment", than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
      { kind: "return-to-hand", target: 2 },
    ],
  },
});
