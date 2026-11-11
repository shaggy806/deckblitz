import { defineCard } from "../define.js";

// Back face of Blitzwing, Cruel Tormentor. Living metal (rule 702.161a):
// during your turn it's an artifact creature as well. "Choose flying or
// indestructible at random" is Umaro's random mode.

const LIVING_METAL_TEXT = "Living metal (During your turn, this Vehicle is also a creature.)";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, choose flying or indestructible at random. Blitzwing gains that ability until end of turn.";
const CONVERT_TEXT = "Whenever Blitzwing deals combat damage to a player, convert it.";

export default defineCard({
  name: "Blitzwing, Adaptive Assailant",
  art: "https://cards.scryfall.io/art_crop/back/d/2/d20738d2-a159-4e3e-be7a-561a121bd447.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 5,
  text: `${LIVING_METAL_TEXT}\n${COMBAT_TEXT}\n${CONVERT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        random: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Blitzwing gains flying until end of turn.",
            effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          },
          {
            text: "Blitzwing gains indestructible until end of turn.",
            effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: CONVERT_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, condition: { kind: "your-turn" }, addTypes: ["creature"], text: LIVING_METAL_TEXT }],
  faces: ["Blitzwing, Cruel Tormentor", "Blitzwing, Adaptive Assailant"],
  transform: true,
});
