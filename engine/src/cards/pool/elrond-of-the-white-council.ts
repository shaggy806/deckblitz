import { defineCard } from "../define.js";

// EDHREC rank 9704.
//
// Rulings:
//   If you have multiple votes, you can vote for fellowship multiple times. If you do, you can
//     choose the same creature each time.
//   After the votes are revealed, starting with the player whose turn it is and proceeding in turn
//     order, each player who voted fellowship chooses a creature they control for each of their
//     fellowship votes. Then the controller of Elrond of the White Council's ability gains control
//     of those creatures and they gain the listed ability. Finally, that player puts a +1/+1
//     counter on each creature they control for each aid vote.
//
// Each fellowship vote is a `choose-permanents` by its voter (`chooser: "that-player"`, in turn
// order from the active player — `for-each-vote`), `thenTogether` with nothing to do then: the
// creature is only chosen, so the same one can be chosen again. Then one `gain-control-all` and
// one `grant-static` over every creature chosen this way.

const TEXT =
  'Secret council — When Elrond enters, each player secretly votes for fellowship or aid, then those votes are revealed. For each fellowship vote, the voter chooses a creature they control. You gain control of each creature chosen this way, and they gain "This creature can\'t attack its owner." Then for each aid vote, put a +1/+1 counter on each creature you control.';

export default defineCard({
  name: "Elrond of the White Council",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { options: ["fellowship", "aid"] }, secret: true },
          {
            kind: "for-each-vote",
            option: 0,
            effect: {
              kind: "choose-permanents",
              chooser: "that-player",
              filter: { type: "creature", controlledBy: "you" },
              min: 1,
              upTo: 1,
              thenTogether: true,
              then: { kind: "sequence", effects: [] },
              prompt: "Choose a creature you control for your fellowship vote",
            },
          },
          { kind: "gain-control-all", filter: { type: "creature", thisWay: "chosen" }, untilEndOfTurn: false },
          {
            kind: "grant-static",
            filter: { type: "creature", thisWay: "chosen" },
            ability: {
              affects: { scope: "self" },
              restrictions: [{ kind: "cant-attack", at: "owner" }],
              text: "This creature can't attack its owner.",
            },
            duration: "permanent",
          },
          {
            kind: "for-each-vote",
            option: 1,
            effect: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
