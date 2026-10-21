import { defineCard } from "../define.js";

// Each enters trigger reads the colours spent on the whole cost — the evoke
// cost included (the rulings) — kept by the permanent from the spell, and as
// it last existed if the evoke sacrifice resolved first.
const DAMAGE = "When this creature enters, if {R}{R} was spent to cast it, this creature deals 3 damage to any target.";
const SEARCH =
  "When this creature enters, if {G}{G} was spent to cast it, search your library for a land card, reveal it, put it into your hand, then shuffle. You gain 2 life.";

export default defineCard({
  name: "Vibrance",
  manaCost: "{3}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 4,
  toughness: 4,
  evoke: { cost: "{R/G}{R/G}" },
  text: `${DAMAGE}\n${SEARCH}\nEvoke {R/G}{R/G}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { R: 2 } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: DAMAGE,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { G: 2 } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "search-library", filter: { type: "land" }, destination: "hand", min: 0, max: 1, reveal: true },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: SEARCH,
    },
  ],
});
