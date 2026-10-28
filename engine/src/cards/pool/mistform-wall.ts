import { CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 29842.

const DEFENDER_TEXT = "This creature has defender as long as it's a Wall.";
const TYPE_TEXT = "{1}: This creature becomes the creature type of your choice until end of turn.";

export default defineCard({
  name: "Mistform Wall",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion", "Wall"],
  power: 1,
  toughness: 4,
  text: `${DEFENDER_TEXT}\n${TYPE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: { kind: "add-types", target: "source", setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: TYPE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { subtype: "Wall" } },
      grantKeywords: ["defender"],
      text: DEFENDER_TEXT,
    },
  ],
});
