import { defineCard } from "../define.js";

const ENTER_TEXT = "This creature enters with seven +1/+1 counters on it.";
const LIFE_TEXT = "Whenever this creature deals damage, you gain that much life.";
const PREVENT_TEXT =
  "If damage would be dealt to this creature, prevent that damage. Remove a +1/+1 counter from this creature.";

// Rulings: the damage is prevented even with no counter left; damage from
// several sources at once is one event, so only one counter goes (`perEvent`,
// Unbreathing Horde's shape).
export default defineCard({
  name: "Phantom Nishoba",
  manaCost: "{5}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Cat", "Beast", "Spirit"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}\n${LIFE_TEXT}\n${PREVENT_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 7 } },
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
