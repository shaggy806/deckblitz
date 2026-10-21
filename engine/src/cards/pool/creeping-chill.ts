import { defineCard } from "../define.js";

// EDHREC rank 20842.
//
// The mill trigger works from the graveyard (Worldspine Wurm's `who:
// "self"`), only for a move from the library. "If you do" is Greenwarden of
// Murasa's this-way check on the exile.
const MILL_TEXT =
  "When Creeping Chill is put into your graveyard from your library, you may exile it. If you do, Creeping Chill deals 3 damage to each opponent and you gain 3 life.";

const DRAIN = {
  kind: "sequence",
  effects: [
    { kind: "damage", amount: 3, who: "each-opponent" },
    { kind: "gain-life", amount: 3 },
  ],
} as const;

export default defineCard({
  name: "Creeping Chill",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Creeping Chill deals 3 damage to each opponent and you gain 3 life.\n${MILL_TEXT}`,
  targets: [],
  effect: DRAIN,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "put-into-graveyard", who: "self", from: "library" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Creeping Chill to deal 3 damage to each opponent and gain 3 life?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            { kind: "conditional", condition: { kind: "this-way", what: "exiled" }, then: DRAIN },
          ],
        },
      },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
