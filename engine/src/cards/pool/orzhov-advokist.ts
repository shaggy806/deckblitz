import { defineCard } from "../define.js";

// EDHREC rank 3364. Each player in turn order may choose a creature they
// control; each who does gets two +1/+1 counters on it and their creatures
// (including ones arriving later) can't attack you or planeswalkers you
// control until your next turn, whatever becomes of Advokist (the rulings).
export default defineCard({
  name: "Orzhov Advokist",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 4,
  text: "At the beginning of your upkeep, each player may put two +1/+1 counters on a creature they control. If a player does, creatures that player controls can't attack you or planeswalkers you control until your next turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        prompt: "Put two +1/+1 counters on a creature you control?",
        effect: {
          kind: "choose-permanents",
          filter: { type: "creature", controlledBy: "you" },
          upTo: 1,
          min: 1,
          prompt: "Choose a creature to put two +1/+1 counters on",
          then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
        },
        ifDid: {
          kind: "restrict",
          filter: { type: "creature", controlledBy: "you" },
          sideOf: "that-player",
          restrictions: [{ kind: "cant-attack", at: "you-and-planeswalkers" }],
          duration: "until-your-next-turn",
        },
      },
      resolve: null,
      text: "At the beginning of your upkeep, each player may put two +1/+1 counters on a creature they control. If a player does, creatures that player controls can't attack you or planeswalkers you control until your next turn.",
    },
  ],
});
