import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 15120. Venturing is rule 701.49 (the player picks the dungeon,
// a completed one included); "this ability triggers only once each turn" is
// `oncePerTurn`, and completing a dungeon is the `completes-dungeon` event
// (rule 309.7).

const CAST_TEXT =
  "Whenever you cast a creature or planeswalker spell, venture into the dungeon. This ability triggers only once each turn.";
const COMPLETE_TEXT = "Whenever you complete a dungeon, create a 2/2 green Wolf creature token.";

export default defineCard({
  name: "Varis, Silverymoon Ranger",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Elf", "Ranger"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach, ward {1}\n${CAST_TEXT} (To venture into the dungeon, enter the first room or advance to the next room.)\n${COMPLETE_TEXT}`,
  triggered: [
    ward({ mana: "{1}" }),
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["creature", "planeswalker"] } },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "completes-dungeon", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: COMPLETE_TEXT,
    },
  ],
});
