import { defineCard } from "../define.js";

// Figure of Destiny's shape: each ability overwrites its creature types and sets
// its base power and toughness for good, and the second and third check its types
// as they resolve (the rulings). "Your opponents" are the players they are as the
// third resolves.

const SCOUT_TEXT = "{G/W}: This creature becomes a Kithkin Scout with base power and toughness 2/3.";
const SOLDIER_TEXT = "{1}{G/W}{G/W}: If this creature is a Scout, it becomes a Kithkin Soldier with base power and toughness 4/5.";
const AVATAR_TEXT =
  "{3}{G/W}{G/W}{G/W}: If this creature is a Soldier, it becomes a Kithkin Avatar with base power and toughness 7/8 and protection from each of your opponents.";

export default defineCard({
  name: "Figure of Fable",
  manaCost: "{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Kithkin"],
  power: 1,
  toughness: 1,
  text: `${SCOUT_TEXT}\n${SOLDIER_TEXT}\n${AVATAR_TEXT}`,
  activated: [
    {
      cost: { mana: "{G/W}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 3,
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Kithkin", "Scout"],
        duration: "permanent",
      },
      resolve: null,
      text: SCOUT_TEXT,
    },
    {
      cost: { mana: "{1}{G/W}{G/W}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Scout" } },
        then: {
          kind: "animate",
          target: "source",
          power: 4,
          toughness: 5,
          addTypes: [],
          addSubtypes: [],
          setSubtypes: ["Kithkin", "Soldier"],
          duration: "permanent",
        },
      },
      resolve: null,
      text: SOLDIER_TEXT,
    },
    {
      cost: { mana: "{3}{G/W}{G/W}{G/W}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Soldier" } },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "animate",
              target: "source",
              power: 7,
              toughness: 8,
              addTypes: [],
              addSubtypes: [],
              setSubtypes: ["Kithkin", "Avatar"],
              duration: "permanent",
            },
            { kind: "grant-protection", target: "source", from: { fromPlayers: "opponents" }, duration: "permanent" },
          ],
        },
      },
      resolve: null,
      text: AVATAR_TEXT,
    },
  ],
});
