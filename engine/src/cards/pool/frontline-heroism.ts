import { defineCard } from "../define.js";

// EDHREC rank 8805.
//
// The copy is aimed at the token just made (`retargetTo: "created"`, rule
// 707.10e): every target of the copy is that token; if it isn't a legal
// target for each of them, as the copy's controller would choose it, there's
// no copy — the token stays. "A spell", not only instants and sorceries: an
// Aura spell's copy becomes an Aura token attached to the Soldier (707.10f).
const ETB_TEXT = "When this enchantment enters, create a 1/1 red Soldier creature token with haste.";
const CAST_TEXT =
  "Whenever you cast a spell that targets only a single creature you control, create a 1/1 red Soldier creature token with haste, then copy that spell. The copy targets that token.";

export default defineCard({
  name: "Frontline Heroism",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ETB_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "1/1 Red Soldier Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { targets: { only: true, single: true, permanent: { type: "creature", controlledBy: "you" } } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "1/1 Red Soldier Token", count: 1 },
          { kind: "copy-spell", target: "trigger-spell", retargetTo: "created" },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
