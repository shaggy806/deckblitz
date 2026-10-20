import { defineCard } from "../define.js";

// Rulings:
//   [2021-07-23] Eccentric Apprentice's last ability works even if it wasn't on the battlefield
//     when you completed a dungeon and even if the dungeon was completed on a previous turn.
//   [2021-07-23] A creature that becomes a Bird this way loses all other creature types but does
//     not lose any of its abilities.
//   [2021-07-23] The last ability will overwrite any previous effects that set the creature's
//     power and toughness to specific numbers. Effects that otherwise modify the target creature's
//     power and toughness will still apply no matter when they took effect. The same is true for
//     +1/+1 counters.

const BIRD_TEXT =
  "At the beginning of combat on your turn, if you've completed a dungeon, up to one target creature becomes a Bird with base power and toughness 1/1 and flying until end of turn.";

export default defineCard({
  name: "Eccentric Apprentice",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Tiefling", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\nWhen this creature enters, venture into the dungeon. (Enter the first room or advance to the next room.)\n${BIRD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "When this creature enters, venture into the dungeon.",
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "completed-dungeon" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "animate",
        target: 0,
        power: 1,
        toughness: 1,
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Bird"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: BIRD_TEXT,
    },
  ],
});
