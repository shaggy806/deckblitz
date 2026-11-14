import { defineCard } from "../define.js";
import { entersTappedStatic } from "../helpers.js";

// The last ability works only from the graveyard (rule 113.6k), Bloodghast's
// way: it triggers on a roll to visit (rule 701.52a) whose result is 6.

const DIES = "When this creature dies, open an Attraction.";
const RETURN =
  "Whenever you roll to visit your Attractions, if you roll a 6, you may return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "\"Lifetime\" Pass Holder",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Guest"],
  power: 2,
  toughness: 1,
  text: `This creature enters tapped.\n${DIES}\n${RETURN}`,
  static: [entersTappedStatic("This creature")],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: DIES,
    },
    {
      fromGraveyard: true,
      trigger: { on: "event", event: "rolls-to-visit", who: "you" },
      // "If you roll a 6": the roll's result, the trigger's value (rule 603.4).
      condition: { kind: "amounts", left: { triggerValue: true }, op: "eq", right: 6 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return \"Lifetime\" Pass Holder from your graveyard to the battlefield?",
        effect: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
