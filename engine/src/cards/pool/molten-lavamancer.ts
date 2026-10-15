import { defineCard } from "../define.js";

// EDHREC rank 26957.
//
// "During your turn" is part of the trigger condition (`whileCondition`), not
// an intervening if; the once-each-turn limit makes "one or more of your
// opponents" exact however many damage events a source deals at once.

const LAVA_TEXT =
  "Whenever a source you control deals noncombat damage to one or more of your opponents during your turn, you create a 1/1 red Elemental creature token. This ability triggers only once each turn.";

export default defineCard({
  name: "Molten Lavamancer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Warlock", "Villain"],
  power: 2,
  toughness: 3,
  text: `Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\n${LAVA_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "deals-damage", who: "you-control", to: "opponent", combat: false },
      whileCondition: { kind: "your-turn" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "1/1 Red Elemental Token", count: 1 },
      resolve: null,
      text: LAVA_TEXT,
    },
  ],
});
