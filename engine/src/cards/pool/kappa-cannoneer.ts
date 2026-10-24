import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const TRIGGER_TEXT =
  "Whenever this creature or another artifact you control enters, put a +1/+1 counter on this creature. It can't be blocked this turn.";

const effect = {
  kind: "sequence",
  effects: [
    { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
    { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
  ],
} as const;

// "This creature or another artifact you control" is two trigger events of
// one ability (`sameAbilityAs`): the creature itself entering, whatever its
// types, and each other artifact you control entering.
export default defineCard({
  name: "Kappa Cannoneer",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Turtle", "Warrior"],
  power: 4,
  toughness: 4,
  improvise: true,
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nWard {4}\nWhenever this creature or another artifact you control enters, put a +1/+1 counter on this creature. It can't be blocked this turn.",
  triggered: [
    ward({ mana: "{4}" }),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      sameAbilityAs: 2,
      targets: [],
      effect,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" }, otherOnly: true },
      sameAbilityAs: 1,
      targets: [],
      effect,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
