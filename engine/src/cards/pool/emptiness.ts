import { defineCard } from "../define.js";

// Each enters trigger reads the colours spent on the whole cost — the evoke
// cost included (the rulings) — kept by the permanent from the spell.
const REANIMATE =
  "When this creature enters, if {W}{W} was spent to cast it, return target creature card with mana value 3 or less from your graveyard to the battlefield.";
const SHRINK = "When this creature enters, if {B}{B} was spent to cast it, put three -1/-1 counters on up to one target creature.";

export default defineCard({
  name: "Emptiness",
  manaCost: "{4}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 3,
  toughness: 5,
  evoke: { cost: "{W/B}{W/B}" },
  text: `${REANIMATE}\n${SHRINK}\nEvoke {W/B}{W/B}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { W: 2 } } },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: REANIMATE,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { B: 2 } } },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 3 },
      resolve: null,
      text: SHRINK,
    },
  ],
});
