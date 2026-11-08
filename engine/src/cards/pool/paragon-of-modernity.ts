import { defineCard } from "../define.js";

const TEXT =
  "{3}: This creature gets +1/+1 until end of turn. If exactly three colors of mana were spent to activate this ability, put a +1/+1 counter on it instead.";

// EDHREC rank 24629. Colorless isn't a color (the ruling; rule 106.1), which
// `count: "colors"` leaves out.
export default defineCard({
  name: "Paragon of Modernity",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Angel", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "ability-mana-spent", clauses: [{ count: "colors", amount: { op: "eq", n: 3 } }] },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        else: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
