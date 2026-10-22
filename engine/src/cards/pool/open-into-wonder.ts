import { defineCard } from "../define.js";

// EDHREC rank 7727. Amonkhet. Exactly X targets (Runed Arch's `min`/`max: "x"`);
// each can't be blocked this turn and gains the draw trigger until end of turn.
const DRAW_TEXT = "Whenever this creature deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Open into Wonder",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `X target creatures can't be blocked this turn. Until end of turn, those creatures gain "${DRAW_TEXT}"`,
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "restrict", target: 0, restrictions: ["cant-be-blocked"] },
        {
          kind: "grant-triggered",
          target: 0,
          duration: "end-of-turn",
          ability: {
            trigger: { on: "deals-combat-damage-to-player", who: "self" },
            targets: [],
            effect: { kind: "draw", amount: 1 },
            resolve: null,
            text: DRAW_TEXT,
          },
        },
      ],
    },
  },
});
