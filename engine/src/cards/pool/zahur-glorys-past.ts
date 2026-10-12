import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 10643.
const SURVEIL_TEXT = "Sacrifice another creature: Surveil 1. Activate only once each turn.";
const ZOMBIE_TEXT = "Whenever a nontoken creature you control dies, create a tapped 2/2 black Zombie creature token.";

export default defineCard({
  name: "Zahur, Glory's Past",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Cat", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${SURVEIL_TEXT}\nMax speed — ${ZOMBIE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "creature" } } },
      otherOnly: true,
      oncePerTurn: true,
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
  static: [
    maxSpeed({
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "you-control", filter: { type: "creature", token: false } },
          targets: [],
          effect: { kind: "create-token", token: "Zombie Token", count: 1, tapped: true },
          resolve: null,
          text: ZOMBIE_TEXT,
        },
      ],
      text: `Max speed — ${ZOMBIE_TEXT}`,
    }),
  ],
});
