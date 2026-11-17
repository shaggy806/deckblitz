import { defineCard } from "../define.js";

// The back face of Arcee, Sharpshooter // Arcee, Acrobatic Coupe.
//
// "That many" is how many creatures and Vehicles you control the spell targets, counted as it's
// cast (`countMatchingTargets`): one that leaves before the trigger resolves still counts.

const LIVING_METAL_TEXT = "Living metal (During your turn, this Vehicle is also a creature.)";
const CAST_TEXT =
  "Whenever you cast a spell that targets one or more creatures or Vehicles you control, put that many +1/+1 counters on Arcee. Convert Arcee.";

export default defineCard({
  name: "Arcee, Acrobatic Coupe",
  // A back face has no Scryfall card of its own name — point at its art.
  art: "https://cards.scryfall.io/art_crop/back/2/1/21462db4-7739-4853-845f-0c2aa38fd2a6.jpg",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 2,
  text: `${LIVING_METAL_TEXT}\n${CAST_TEXT}`,
  faces: ["Arcee, Sharpshooter", "Arcee, Acrobatic Coupe"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{R}{W}" },
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      addTypes: ["creature"],
      text: LIVING_METAL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { targets: { permanent: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }], controlledBy: "you" } } },
        countMatchingTargets: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
