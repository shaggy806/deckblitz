import { defineCard } from "../define.js";

// EDHREC rank 24564.
//
// Rulings:
//   [2014-11-24] If a mode requires a target and there are no legal targets available, that mode
//     can't be chosen. You must choose another mode if able.
//   [2014-11-24] You choose which mode you're using as you put the ability on the stack, after the
//     creature has entered the battlefield. Once you've chosen a mode, you can't change that mode
//     even if the creature leaves the battlefield in response to that ability.

export default defineCard({
  name: "Sandsteppe Outcast",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, choose one —\n• Put a +1/+1 counter on this creature.\n• Create a 1/1 white Spirit creature token with flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 }, text: "Put a +1/+1 counter on this creature." },
          { effect: { kind: "create-token", token: "Spirit Token", count: 1 }, text: "Create a 1/1 white Spirit creature token with flying." },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —\n• Put a +1/+1 counter on this creature.\n• Create a 1/1 white Spirit creature token with flying.",
    },
  ],
});
