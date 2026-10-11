import { defineCard } from "../define.js";

// EDHREC rank 6761.
//
// Rulings:
//   As Tough Cookie's second ability resolves, the target permanent keeps any other types and
//     subtypes it had before it became an artifact creature.
//
// `animate` keeps the target's printed types and subtypes (a Food stays a
// Food, rule 205.1b) and adds creature; it's an artifact already.
const ETB_TEXT =
  "When this creature enters, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";
const ANIMATE_TEXT = "{2}{G}: Until end of turn, target noncreature artifact you control becomes a 4/4 artifact creature.";
const FOOD_TEXT = "{2}, {T}, Sacrifice this creature: You gain 3 life.";

export default defineCard({
  name: "Tough Cookie",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Food", "Golem"],
  power: 2,
  toughness: 2,
  text: `${ETB_TEXT}\n${ANIMATE_TEXT}\n${FOOD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact", notTypes: ["creature"] } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: FOOD_TEXT,
    },
  ],
});
