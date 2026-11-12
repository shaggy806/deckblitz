import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. The first spell you cast during each of
// your turns has assist (rule 702.132) while Yume is on the battlefield
// (`assistFirstSpellOfYourTurns`). The trigger is that same spell — the first
// you cast this turn, on your turn — and its "if" reads who helped pay
// (`assisted`, `{ assistantOf }`) on resolution.
const ASSIST_TEXT =
  "The first spell you cast during each of your turns has assist. When you cast that spell, if another player spent mana to cast it, you and that player each draw a card. (As you cast a spell with assist, you may choose another player. They may pay some or all of the generic mana in the spell's cost.)";

export default defineCard({
  name: "Yume, Chronicler of Valor",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 2,
  text: ASSIST_TEXT,
  static: [
    {
      affects: { scope: "self" },
      assistFirstSpellOfYourTurns: true,
      text: "The first spell you cast during each of your turns has assist.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstTimeEachTurn: true },
      condition: { kind: "your-turn" },
      targets: [],
      // Who helped pay is fixed once the spell is cast, so the "if" asked on
      // resolution is the "if" asked as it triggered (rule 603.4).
      effect: {
        kind: "conditional",
        condition: { kind: "object-matches", object: "trigger-object", filter: { assisted: true } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "draw", amount: 1, who: { assistantOf: "trigger-object" } },
          ],
        },
      },
      resolve: null,
      text: "When you cast that spell, if another player spent mana to cast it, you and that player each draw a card.",
    },
  ],
});
