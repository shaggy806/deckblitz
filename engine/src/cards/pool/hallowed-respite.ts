import { defineCard } from "../define.js";

// EDHREC rank 15517.
//
// The flicker's return is at once, so what follows reads it through `this-way`:
// nothing returned (a commander sent to the command zone instead) gets neither
// branch's effect.
const RETURNED = { thisWay: "put-onto-battlefield" } as const;

export default defineCard({
  name: "Hallowed Respite",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "Exile target nonlegendary creature, then return it to the battlefield under its owner's control. If it entered under your control, put a +1/+1 counter on it. Otherwise, tap it.\nFlashback {1}{W}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "permanent", filter: { type: "creature", notSupertype: "legendary" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "flicker", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "put-onto-battlefield", who: "you" },
        then: { kind: "add-counter-all", filter: RETURNED, counter: "+1/+1", amount: 1 },
        else: { kind: "tap-all", filter: RETURNED },
      },
    ],
  },
  flashback: { cost: "{1}{W}{U}" },
});
