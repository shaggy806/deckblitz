import { defineCard } from "../define.js";

// EDHREC rank 27313.
//
// The draw counts every creature on the battlefield with power less than 0 as
// the trigger resolves, after the -3/-0 — the targeted creature included.

const ATTACK_TEXT =
  "Whenever Wasp attacks, up to one other target creature gets -3/-0 until your next turn. Then draw a card for each creature with power less than 0 on the battlefield.";

export default defineCard({
  name: "Wasp, Shrinking Savior",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: -3, toughness: 0, duration: "until-your-next-turn" },
          { kind: "draw", amount: { countOf: { type: "creature", power: { op: "lt", n: 0 } } } },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
