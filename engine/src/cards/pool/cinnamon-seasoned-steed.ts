import { defineCard } from "../define.js";

const HORSE_TEXT =
  "Other Food creatures you control have horsemanship. (They can't be blocked except by creatures with horsemanship.)";
const COMBAT_TEXT =
  "At the beginning of your combat step, you may put a +1/+1 counter on target noncreature Food you control. If you do, it becomes a 0/0 Knight creature in addition to its other types.";
const FOOD_TEXT = "{2}, {T}, Sacrifice Cinnamon, Seasoned Steed: You gain 3 life.";

export default defineCard({
  name: "Cinnamon, Seasoned Steed",
  manaCost: "{1}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Food", "Horse"],
  power: 1,
  toughness: 1,
  text: `${HORSE_TEXT}\n${COMBAT_TEXT}\n${FOOD_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Food" },
      grantKeywords: ["horsemanship"],
      text: HORSE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", filter: { subtype: "Food", notTypes: ["creature"], controlledBy: "you" } }],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on the Food?",
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        // No duration: it stays a 0/0 Knight creature (with its counter).
        then: {
          kind: "become",
          target: 0,
          power: 0,
          toughness: 0,
          addTypes: ["creature"],
          addSubtypes: ["Knight"],
          duration: "permanent",
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: FOOD_TEXT,
    },
  ],
});
