import { defineCard } from "../define.js";

const TRIGGER = "Whenever a Dragon you control attacks, creatures defending player controls get -1/-1 until end of turn.";

export default defineCard({
  name: "Silumgar, the Drifting Death",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 7,
  keywords: ["flying", "hexproof"],
  text: `Flying, hexproof\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtype: "Dragon" } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        controlledByPlayer: "trigger-player",
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
