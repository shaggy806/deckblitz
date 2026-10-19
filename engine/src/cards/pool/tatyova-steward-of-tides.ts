import { defineCard } from "../define.js";

// EDHREC rank 9519.
//
// Rulings:
//   You may choose to target the land that entered the battlefield with Tatyova, Steward of
//     Tides's triggered ability.
//   If multiple lands enter the battlefield simultaneously, all of those lands are counted. For
//     example, if you control six lands and two lands enter the battlefield at the same time,
//     Tatyova's ability will trigger twice.
//
// The seven-lands clause is an intervening-if (rule 603.4), read after the
// whole entering event. The animation has no duration: the land stays a 3/3
// Elemental creature with haste.
const FLYING_TEXT = "Land creatures you control have flying.";
const TRIGGER_TEXT =
  "Whenever a land you control enters, if you control seven or more lands, up to one target land you control becomes a 3/3 Elemental creature with haste. It's still a land.";

export default defineCard({
  name: "Tatyova, Steward of Tides",
  manaCost: "{G}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Druid"],
  power: 3,
  toughness: 3,
  text: `${FLYING_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["land", "creature"], controlledBy: "you" } },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you", filter: { type: "land", controlledBy: "you" } },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 7 },
      targets: [{ kind: "optional", of: "land-you-control" }],
      effect: {
        kind: "animate",
        target: 0,
        power: 3,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        keywords: ["haste"],
        duration: "permanent",
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
