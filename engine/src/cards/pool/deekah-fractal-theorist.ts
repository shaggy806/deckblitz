import { defineCard } from "../define.js";

// Magecraft: "that spell's mana value" is the spell's or copy's as it last
// was on the stack once it's gone (rule 608.2h) — a copy countered in
// response ceased to exist (707.10a) and is read from its last-known
// information (`GameState.ceasedTokens`).
export default defineCard({
  name: "Deekah, Fractal Theorist",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text:
    "Magecraft — Whenever you cast or copy an instant or sorcery spell, create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is that spell's mana value.\n" +
    "{3}{U}: Target creature token can't be blocked this turn.",
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        orCopy: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Fractal Token",
        count: 1,
        thenCounters: { kind: "+1/+1", amount: { manaValueOf: "trigger-object" } },
      },
      resolve: null,
      text: "Magecraft — Whenever you cast or copy an instant or sorcery spell, create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is that spell's mana value.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", token: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{3}{U}: Target creature token can't be blocked this turn.",
    },
  ],
});
