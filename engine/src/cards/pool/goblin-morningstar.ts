import { defineCard } from "../define.js";

// EDHREC rank 10867.
// Makes Goblin → uses "Goblin Token".
//
// The roll's 10—20 row is Dwarven Shortsword's "create …, then attach this
// Equipment to it": the attach does nothing if the Morningstar has left by
// then.
const ROLL_TEXT =
  "When this Equipment enters, roll a d20.\n1—9 | Create a 1/1 red Goblin creature token.\n10—20 | Create a 1/1 red Goblin creature token, then attach this Equipment to it.";

export default defineCard({
  name: "Goblin Morningstar",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+0 and has trample.\nEquip {1}{R}\n${ROLL_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}{R}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "create-token", token: "Goblin Token", count: 1 } },
          {
            min: 10,
            max: 20,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "create-token", token: "Goblin Token", count: 1 },
                { kind: "attach", target: "created", attachment: "source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: ROLL_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["trample"],
      text: "Equipped creature gets +1/+0 and has trample.",
    },
  ],
});
