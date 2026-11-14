import { defineCard } from "../define.js";

// The second ability's X is announced as it's activated (rules 107.3,
// 601.2b), offered only where some set of other artifacts you control adds up
// to it; the target's "mana value X or less" reads it, and the artifacts are
// chosen and exiled as the cost is paid (601.2h) — `AbilityCost.do`'s
// `choose-permanents` with a `totalManaValue` rule.

const SPEND_TEXT = "Spend this mana only to cast an artifact spell or activate an ability of an artifact source.";
const MANA_TEXT = `{T}: Add {W}. ${SPEND_TEXT}`;
const RETURN_TEXT =
  "{2}{W}, {T}, Exile one or more other artifacts you control with total mana value X: Return target artifact card with mana value X or less from your graveyard to the battlefield. Activate only as a sorcery.";

export default defineCard({
  name: "Fabrication Foundry",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "W",
        amount: 1,
        spendOnly: { spell: { type: "artifact" }, abilityOf: { type: "artifact" }, abilityOfAnyZone: true, text: SPEND_TEXT },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: {
        mana: "{2}{W}",
        tap: true,
        do: {
          kind: "choose-permanents",
          filter: { type: "artifact", controlledBy: "you" },
          exceptSource: true,
          min: 1,
          upTo: { countOf: { type: "artifact", controlledBy: "you" } },
          together: { totalManaValue: "x" },
          then: { kind: "exile", target: 0 },
          prompt: "Exile one or more other artifacts you control with total mana value X",
        },
      },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact", manaValue: { op: "lte", n: "x" } } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      sorcerySpeed: true,
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
