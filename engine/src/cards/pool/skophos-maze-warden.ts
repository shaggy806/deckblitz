import { defineCard } from "../define.js";

// EDHREC rank 26436.
//
// The trigger sees only an ability whose source is a land you control named
// Labyrinth of Skophos (`abilitySource`, read as that land is as it targets),
// and only another creature becoming its target. The fight is optional ("you
// may"), between this creature and that one (rule 701.14a); if either has
// left the battlefield or stopped being a creature, neither deals damage
// (701.14b).
const PUMP = "{1}: This creature gets +1/-1 until end of turn.";
const TEXT =
  "Whenever another creature becomes the target of an ability of a land you control named Labyrinth of Skophos, you may have this creature fight that creature. (Each deals damage equal to its power to the other.)";

export default defineCard({
  name: "Skophos Maze-Warden",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 3,
  toughness: 4,
  text: `${PUMP}\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "becomes-target",
        who: "any",
        filter: { type: "creature" },
        otherOnly: true,
        abilitySource: { type: "land", controlledBy: "you", hasName: "Labyrinth of Skophos" },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Skophos Maze-Warden fight that creature?",
        effect: { kind: "fight", a: "source", b: "trigger-object" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
