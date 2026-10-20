import { defineCard } from "../define.js";

// EDHREC rank 9550. Final Fantasy (FIC).
//
// "If you have a full party, it deals 3 damage … instead" is read as the
// trigger resolves (rule 700.8c) — a `conditional`, not an intervening if.

const ACTIVATED_TEXT = "{B}, {T}: Another target creature you control gains deathtouch until end of turn.";
const CAST_TEXT =
  "Whenever you cast a noncreature spell, The Destined Black Mage deals 1 damage to each opponent. If you have a full party, it deals 3 damage to each opponent instead.";

export default defineCard({
  name: "The Destined Black Mage",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ACTIVATED_TEXT}\n${CAST_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "full-party" },
        then: { kind: "damage", amount: 3, who: "each-opponent" },
        else: { kind: "damage", amount: 1, who: "each-opponent" },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
