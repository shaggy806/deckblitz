import { defineCard } from "../define.js";

export default defineCard({
  name: "Ennis, Debate Moderator",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "When Ennis enters, exile up to one other target creature you control. Return that card to the battlefield under its owner's control at the beginning of the next end step.\nAt the beginning of your end step, if one or more cards were put into exile this turn, put a +1/+1 counter on Ennis.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: { step: "end" },
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: "When Ennis enters, exile up to one other target creature you control. Return that card to the battlefield under its owner's control at the beginning of the next end step.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "cards-put-into-exile", who: "any-player", atLeast: 1 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "At the beginning of your end step, if one or more cards were put into exile this turn, put a +1/+1 counter on Ennis.",
    },
  ],
});
