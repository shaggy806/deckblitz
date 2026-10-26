import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 15261.
//
// Ascendant Spirit's shape. None of the abilities has a duration, and each
// overwrites its creature types and base power and toughness (the rulings);
// the flying and first strike the last one grants are an effect of their own,
// so a later first ability makes an 8/8 a 2/2 Kithkin Spirit that keeps them
// (the first ruling). The second and third check its creature types as they
// resolve, however it got them.

const SPIRIT_TEXT = "{R/W}: This creature becomes a Kithkin Spirit with base power and toughness 2/2.";
const WARRIOR_TEXT =
  "{R/W}{R/W}{R/W}: If this creature is a Spirit, it becomes a Kithkin Spirit Warrior with base power and toughness 4/4.";
const AVATAR_TEXT =
  "{R/W}{R/W}{R/W}{R/W}{R/W}{R/W}: If this creature is a Warrior, it becomes a Kithkin Spirit Warrior Avatar with base power and toughness 8/8, flying, and first strike.";

export default defineCard({
  name: "Figure of Destiny",
  manaCost: "{R/W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Kithkin"],
  power: 1,
  toughness: 1,
  text: `${SPIRIT_TEXT}\n${WARRIOR_TEXT}\n${AVATAR_TEXT}`,
  activated: [
    {
      cost: { mana: "{R/W}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Kithkin", "Spirit"],
        duration: "permanent",
      },
      resolve: null,
      text: SPIRIT_TEXT,
    },
    {
      cost: { mana: "{R/W}{R/W}{R/W}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Spirit" } },
        then: {
          kind: "animate",
          target: "source",
          power: 4,
          toughness: 4,
          addTypes: [],
          addSubtypes: [],
          setSubtypes: ["Kithkin", "Spirit", "Warrior"],
          duration: "permanent",
        },
      },
      resolve: null,
      text: WARRIOR_TEXT,
    },
    {
      cost: { mana: "{R/W}{R/W}{R/W}{R/W}{R/W}{R/W}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Warrior" } },
        then: {
          kind: "animate",
          target: "source",
          power: 8,
          toughness: 8,
          addTypes: [],
          addSubtypes: [],
          setSubtypes: ["Kithkin", "Spirit", "Warrior", "Avatar"],
          keywords: ["flying", "first-strike"],
          duration: "permanent",
        },
      },
      resolve: null,
      text: AVATAR_TEXT,
    },
  ],
});
