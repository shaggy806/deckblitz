import { defineCard } from "../define.js";

// EDHREC rank 26676.
// Unbreathing Horde's replacement: one counter per damage event however many
// sources (`perEvent`), and the damage is prevented with no counter left too
// (the rulings).

const ENTER_TEXT = "This creature enters with two +1/+1 counters on it.";
const PREVENT_TEXT =
  "If damage would be dealt to this creature, prevent that damage. Remove a +1/+1 counter from this creature.";

export default defineCard({
  name: "Phantom Nomad",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Nomad"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        perEvent: true,
        to: "self",
        then: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      text: PREVENT_TEXT,
    },
  ],
});
