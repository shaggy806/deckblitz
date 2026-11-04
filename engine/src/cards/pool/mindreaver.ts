import { defineCard } from "../define.js";

// Rulings:
//   If Mindreaver leaves the battlefield, and later another Mindreaver enters the battlefield, it is
//     a new object. The last ability of the second Mindreaver doesn't refer to any cards exiled with
//     the first one.
//   The cards are exiled face up. All players can look at them.

const HEROIC_TEXT = "Heroic — Whenever you cast a spell that targets this creature, exile the top three cards of target player's library.";
const COUNTER_TEXT = "{U}{U}, Sacrifice this creature: Counter target spell with the same name as a card exiled with this creature.";

export default defineCard({
  name: "Mindreaver",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: `${HEROIC_TEXT}\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      resolve: null,
      text: HEROIC_TEXT,
      targets: ["player"],
      effect: { kind: "exile-from-library", whose: 0, amount: 3, linked: true },
    },
  ],
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false, sacrifice: "self" },
      resolve: null,
      text: COUNTER_TEXT,
      targets: [{ kind: "spell", filter: { sameNameWith: "exiled-with-source" } }],
      effect: { kind: "counter", target: 0 },
    },
  ],
});
