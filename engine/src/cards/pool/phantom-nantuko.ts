import { defineCard } from "../define.js";

const ENTER_TEXT = "This creature enters with two +1/+1 counters on it.";
const PREVENT_TEXT =
  "If damage would be dealt to this creature, prevent that damage. Remove a +1/+1 counter from this creature.";

// Rulings: the damage is prevented even with no counter left; damage from
// several sources at once is one event, so only one counter goes (`perEvent`,
// Unbreathing Horde's shape).
export default defineCard({
  name: "Phantom Nantuko",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Spirit"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}\n${PREVENT_TEXT}\n{T}: Put a +1/+1 counter on this creature.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{T}: Put a +1/+1 counter on this creature.",
    },
  ],
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
