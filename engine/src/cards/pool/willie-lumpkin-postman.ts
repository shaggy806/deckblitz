import { defineCard } from "../define.js";

const MAIL =
  "Whenever Willie Lumpkin deals combat damage to an opponent, you draw a card and that player may draw a card. If they do, that player can't attack you or permanents you control during their next turn.";

// "During their next turn" is the player effect's `{ duringTurnOf }`: it
// waits, doing nothing, until that player's next turn begins, then lasts
// through it. "You or permanents you control" covers a battle you control
// too (`"you-and-permanents"`).
export default defineCard({
  name: "Willie Lumpkin, Postman",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 1,
  toughness: 3,
  text: `Willie Lumpkin can't be blocked.\n${MAIL}`,
  static: [{ affects: { scope: "self" }, grantKeywords: ["unblockable"], text: "Willie Lumpkin can't be blocked." }],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent", combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "each-player-may",
            who: "trigger-player",
            prompt: "Draw a card? If you do, you can't attack them or their permanents during your next turn.",
            effect: { kind: "draw", amount: 1 },
            ifDid: {
              kind: "restrict",
              filter: { type: "creature", controlledBy: "you" },
              sideOf: "that-player",
              restrictions: [{ kind: "cant-attack", at: "you-and-permanents" }],
              duration: { duringTurnOf: "that-player" },
            },
          },
        ],
      },
      resolve: null,
      text: MAIL,
    },
  ],
});
