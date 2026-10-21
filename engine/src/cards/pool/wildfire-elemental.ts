import { defineCard } from "../define.js";

// EDHREC rank 21037. Massacre Girl, Most Wanted's trigger: once per opponent
// dealt noncombat damage in an event (the rulings), whatever the amount.

const TEXT = "Whenever an opponent is dealt noncombat damage, creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Wildfire Elemental",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "opponent", combat: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
