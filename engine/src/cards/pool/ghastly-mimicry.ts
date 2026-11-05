import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, create a token that's a copy of enchanted creature, except it's a Spirit in addition to its other types.";
const EXILE_TEXT = "If Ghastly Mimicry would be put into a graveyard from anywhere, exile it instead.";

/** The disturb back face of Mirrorhall Mimic, an Aura cast from the graveyard
 * targeting what it will enchant. Its "exile it instead" is the face's own
 * ability (`self`), as on Ancestor's Embrace. */
export default defineCard({
  name: "Ghastly Mimicry",
  art: "https://cards.scryfall.io/art_crop/back/8/2/823ad188-bd56-476d-9853-bed90bfad582.jpg",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${UPKEEP_TEXT}\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: "enchanted",
        count: 1,
        who: "you",
        exceptions: { addSubtypes: ["Spirit"] },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Mirrorhall Mimic", "Ghastly Mimicry"],
  transform: true,
  disturb: { cost: "{3}{U}{U}" },
});
