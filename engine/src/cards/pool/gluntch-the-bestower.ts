import { defineCard } from "../define.js";

// EDHREC rank 3100.
//
// Rulings:
//   [2022-06-10] You may choose a player who doesn't control any creatures as the first chosen
//     player.
//   [2022-06-10] The first chosen player gets to choose which creature they will place the
//     counters on.
//   [2022-06-10] All three players must be different players, although any one of them can be
//     you. If there are only two players in the game, you won't choose a third player, and no one
//     will create Treasure tokens.
//
// Each choice is made in turn as the ability resolves, among every player
// (`anyPlayer`) less those chosen before it (`thenAnother`); with two players
// the second is forced and there's no third. The first chosen player picks
// their own creature and puts the counters on it (`as-player`), the second
// draws, the third creates the Treasures under their control.

const TEXT =
  "At the beginning of your end step, choose a player. They put two +1/+1 counters on a creature they control. Choose a second player to draw a card. Then choose a third player to create two Treasure tokens.";

export default defineCard({
  name: "Gluntch, the Bestower",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Jellyfish"],
  power: 0,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "choose-opponent",
        anyPlayer: true,
        purpose: "to put two +1/+1 counters on a creature they control",
        then: {
          kind: "as-player",
          who: "that-player",
          effect: {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            min: 1,
            upTo: 1,
            then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
            prompt: "Put two +1/+1 counters on a creature you control",
          },
        },
        thenAnother: {
          kind: "choose-opponent",
          anyPlayer: true,
          purpose: "to draw a card",
          then: { kind: "as-player", who: "that-player", effect: { kind: "draw", amount: 1 } },
          thenAnother: {
            kind: "choose-opponent",
            anyPlayer: true,
            purpose: "to create two Treasure tokens",
            then: {
              kind: "as-player",
              who: "that-player",
              effect: { kind: "create-token", token: "Treasure Token", count: 2 },
            },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
