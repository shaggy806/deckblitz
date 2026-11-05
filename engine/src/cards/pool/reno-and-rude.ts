import { defineCard } from "../define.js";

const TEXT =
  "Whenever Reno and Rude deals combat damage to a player, exile the top card of that player's library. Then you may sacrifice another creature or artifact. If you do, you may play the exiled card this turn, and mana of any type can be spent to cast it.";

// The top card, whatever it is, is the first card a reveal-until with no
// filter exiles; its `then` names it in slot 0.
export default defineCard({
  name: "Reno and Rude",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-until",
        whose: "that-player",
        filter: {},
        exile: true,
        rest: "stay",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "may",
              prompt: "Sacrifice another creature or artifact? (If you do, you may play the exiled card this turn.)",
              effect: {
                kind: "sacrifice",
                who: "you",
                filter: { typesAnyOf: ["creature", "artifact"] },
                count: 1,
                exceptSource: true,
              },
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed" },
              then: { kind: "allow-cast-from-exile", target: 0, plays: true, spendAs: "any-type" },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
