import { defineCard } from "../define.js";

// Each enters trigger reads the colours spent on the whole cost — the evoke
// cost included (the rulings) — kept by the permanent from the spell.
const TOKENS = "When this creature enters, if {W}{W} was spent to cast it, create two 1/1 green and white Kithkin creature tokens.";
const PUMP =
  "When this creature enters, if {R}{R} was spent to cast it, creatures you control get +1/+1 and gain haste until end of turn.";
const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Catharsis",
  manaCost: "{4}{R/W}{R/W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 3,
  toughness: 4,
  evoke: { cost: "{R/W}{R/W}" },
  text: `${TOKENS}\n${PUMP}\nEvoke {R/W}{R/W} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { W: 2 } } },
      targets: [],
      effect: { kind: "create-token", token: "Kithkin Token", count: 2 },
      resolve: null,
      text: TOKENS,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { R: 2 } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: YOURS, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP,
    },
  ],
});
