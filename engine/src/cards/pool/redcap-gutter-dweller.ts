import { defineCard } from "../define.js";

// EDHREC rank 8563. Wilds of Eldraine. The upkeep trigger is Vampire Gourmand's "you may sacrifice
// another creature. If you do" around Count on Luck's impulse draw. If this
// creature has left by then, the sacrifice and the exile still happen and only
// the counter has nowhere to go (its ruling); the exiled card is played with
// every cost and timing rule (its other ruling).
const ENTER_TEXT =
  'When this creature enters, create two 1/1 black Rat creature tokens with "This token can\'t block."';
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may sacrifice another creature. If you do, put a +1/+1 counter on this creature and exile the top card of your library. You may play that card this turn.";

export default defineCard({
  name: "Redcap Gutter-Dweller",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Rat Token (Can't Block)", count: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
