import { defineCard } from "../define.js";

// EDHREC rank 1766.
//
// "Each opponent chooses" isn't a vote (Master of Ceremonies' shape): one at a time from the active
// player, each knowing the choices before theirs (rule 101.4b). The creatures are chosen as it
// resolves, by the caster, never targeted, so hexproof doesn't stop them. Choosing none isn't an
// option unless that player controls none. Each creature's untap and haste follow its own gain of
// control: nothing between them can tell.
const TEXT =
  "Each opponent chooses fame or fortune. For each player who chose fame, gain control of a creature that player controls until end of turn. Untap those creatures and they gain haste until end of turn. For each player who chose fortune, you draw a card and create a Treasure token.";

export default defineCard({
  name: "Seize the Spotlight",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", choose: true, who: "each-opponent", for: { options: ["fame", "fortune"] } },
      {
        kind: "for-each-vote",
        option: 0,
        effect: {
          kind: "choose-permanents",
          filter: { type: "creature" },
          controlledByPlayer: "that-player",
          min: 1,
          upTo: 1,
          prompt: "Gain control of a creature that player controls until end of turn",
          then: {
            kind: "sequence",
            effects: [
              { kind: "gain-control", target: 0, untilEndOfTurn: true },
              { kind: "untap", target: 0 },
              { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
            ],
          },
        },
      },
      {
        kind: "for-each-vote",
        option: 1,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "create-token", token: "Treasure Token", count: 1 },
          ],
        },
      },
    ],
  },
});
