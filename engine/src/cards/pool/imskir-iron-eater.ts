import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 7055.
// X is counted once as the trigger resolves (the ruling) — half the artifacts
// you control, rounded down. The sacrificed artifact's mana value is read as
// it last existed on the battlefield (the ruling; Broadside Bombardiers).
const ETB_TEXT =
  "When Imskir enters, you draw X cards and you lose X life, where X is half the number of artifacts you control, rounded down.";
const X = { half: { countOf: { type: "artifact", controlledBy: "you" } }, round: "down" } as const;

export default defineCard({
  name: "Imskir Iron-Eater",
  manaCost: "{6}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  selfCostReduction: affinity({ type: "artifact" }),
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nWhen Imskir enters, you draw X cards and you lose X life, where X is half the number of artifacts you control, rounded down.\n{3}{R}, Sacrifice an artifact: Imskir deals damage equal to the sacrificed artifact's mana value to any target.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: X },
          { kind: "lose-life", amount: X },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false, sacrifice: { filter: { type: "artifact", controlledBy: "you" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { manaValueOf: "sacrificed" }, target: 0 },
      resolve: null,
      text: "{3}{R}, Sacrifice an artifact: Imskir deals damage equal to the sacrificed artifact's mana value to any target.",
    },
  ],
});
