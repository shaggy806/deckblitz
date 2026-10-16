import { defineCard } from "../define.js";

// EDHREC rank 10492. The Lost Caverns of Ixalan.
//
// Goblin Wardriver's battle cry, and Aerid Konstrari's "enters or dies" as
// two triggers making one Bat each.

const BAT_TEXT = "When this creature enters or dies, create a 1/1 black Bat creature token with flying.";

export default defineCard({
  name: "Sanguine Evangelist",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 2,
  toughness: 1,
  text: `Battle cry (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.)\n${BAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Battle cry",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Bat Token", count: 1 },
      resolve: null,
      text: BAT_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Bat Token", count: 1 },
      resolve: null,
      text: BAT_TEXT,
    },
  ],
});
