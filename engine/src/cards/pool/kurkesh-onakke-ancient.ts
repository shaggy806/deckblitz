import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 18144.
//
// Never a mana ability (those don't use the stack). An ability of an artifact
// on the battlefield as it's activated; Kurkesh sacrificed to pay the cost is
// gone before the trigger, so nothing is copied (the rulings).

const TEXT =
  "Whenever you activate an ability of an artifact, if it isn't a mana ability, you may pay {R}. If you do, copy that ability. You may choose new targets for the copy.";

export default defineCard({
  name: "Kurkesh, Onakke Ancient",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ogre", "Spirit"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "activates-ability", who: "you", source: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {R} to copy that ability?",
        cost: "{R}",
        effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
