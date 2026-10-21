import { defineCard } from "../define.js";

// Each enters trigger reads the colours spent on the whole cost — the evoke
// cost included (the rulings) — kept by the permanent from the spell.
const BOUNCE =
  "When this creature enters, if {U}{U} was spent to cast it, return up to one other target nonland permanent to its owner's hand.";
const DISCARD =
  "When this creature enters, if {B}{B} was spent to cast it, target opponent reveals their hand. You choose a nonland card from it. That player discards that card.";

export default defineCard({
  name: "Deceit",
  manaCost: "{4}{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 5,
  toughness: 5,
  evoke: { cost: "{U/B}{U/B}" },
  text: `${BOUNCE}\n${DISCARD}\nEvoke {U/B}{U/B}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { U: 2 } } },
      targets: [{ kind: "optional", of: { kind: "other", of: "nonland-permanent" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { B: 2 } } },
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      resolve: null,
      text: DISCARD,
    },
  ],
});
