import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. "To a player who doesn't have a contract
// counter" is asked as it triggers (`toPlayerIf`). That player may take the
// deal (`each-player-may`, "you" in it being them); if they did — they now have
// the counter they lacked — Miss Highwater's controller sets up the lasting
// "when they lose the game" (a delayed trigger watching that one player, for
// the rest of the game, while they have a contract counter). Its batch is
// what they controlled as the loss was announced, before they left the game
// (800.4a); each artifact and creature of it is copied under the delayed
// trigger's controller ("create a token").
const HAS_CONTRACT = { kind: "player-counters", counter: "contract", who: "that-player", atLeast: 1 } as const;
const DEAL_TEXT =
  "Whenever Miss Highwater deals combat damage to a player who doesn't have a contract counter, they may discard their hand. If they do, they draw seven cards and get a contract counter. For as long as they have a contract counter, when they lose the game, for each artifact and creature they controlled, create a token that's a copy of it.";

export default defineCard({
  name: "Miss Highwater",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Advisor"],
  power: 5,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${DEAL_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "self",
        toPlayerIf: { kind: "not", of: HAS_CONTRACT },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "each-player-may",
            who: "trigger-player",
            prompt: "Discard your hand, draw seven cards and get a contract counter?",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "discard-hand", who: "you" },
                { kind: "draw", amount: 7 },
                { kind: "add-player-counters", counter: "contract", amount: 1, who: "you" },
              ],
            },
          },
          {
            kind: "conditional",
            condition: HAS_CONTRACT,
            then: {
              kind: "delayed-trigger",
              at: {
                whenever: { on: "event", event: "loses-game", who: "any" },
                byPlayer: "trigger-player",
                until: "permanent",
                once: true,
              },
              if: { ...HAS_CONTRACT, asTheyLeave: true },
              effect: {
                kind: "create-token-copy",
                of: "trigger-batch",
                ofMatching: { typesAnyOf: ["artifact", "creature"] },
                count: 1,
                who: "you",
              },
              text: "When they lose the game, for each artifact and creature they controlled, create a token that's a copy of it.",
            },
          },
        ],
      },
      resolve: null,
      text: DEAL_TEXT,
    },
  ],
});
