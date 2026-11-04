import { defineCard } from "../define.js";

// Amonkhet. Neither ability undoes an attack, block or activation already made
// (the rulings): a restriction is read as attackers and blockers are declared,
// a prohibition as an ability is activated.
const FIRST_TEXT = "{1}, {T}: Target creature can't attack this turn. Put a brick counter on this artifact.";
const SECOND_TEXT =
  "{1}, {T}: Until your next turn, target creature can't attack or block and its activated abilities can't be activated. Activate only if there are three or more brick counters on this artifact.";

export default defineCard({
  name: "Edifice of Authority",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${FIRST_TEXT}\n${SECOND_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["cant-attack"] },
          { kind: "add-counter", target: "source", counter: "brick", amount: 1 },
        ],
      },
      resolve: null,
      text: FIRST_TEXT,
    },
    {
      cost: { mana: "{1}", tap: true },
      condition: { kind: "self-counters", counter: "brick", compare: { op: "gte", n: 3 } },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["cant-attack", "cant-block"], duration: "until-your-next-turn" },
          { kind: "prohibit", target: 0, abilities: true, duration: "until-your-next-turn" },
        ],
      },
      resolve: null,
      text: SECOND_TEXT,
    },
  ],
});
