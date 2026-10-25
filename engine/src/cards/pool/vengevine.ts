import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast a spell, if it's the second creature spell you cast this turn, you may return this card from your graveyard to the battlefield.";

// The second creature spell of the turn, counted over the whole turn — not
// only those cast while Vengevine was in the graveyard (the rulings) — is the
// cast trigger's `nthEachTurn` over its creature filter; a third doesn't fire.
export default defineCard({
  name: "Vengevine",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" }, nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Vengevine from your graveyard to the battlefield?",
        effect: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
