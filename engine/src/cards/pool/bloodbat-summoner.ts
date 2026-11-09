import { defineCard } from "../define.js";

// The Blood token stays a Blood artifact token with its own ability (its
// ruling), and the change has no duration.
const TEXT =
  "At the beginning of combat on your turn, up to one target Blood token you control becomes a 2/2 black Bat creature with flying and haste in addition to its other types.";

export default defineCard({
  name: "Bloodbat Summoner",
  art: "https://cards.scryfall.io/art_crop/back/4/b/4b4390f4-451f-4575-96e0-dc4dcb45ad8f.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [
        { kind: "optional", of: { kind: "permanent", filter: { subtype: "Blood", token: true, controlledBy: "you" } } },
      ],
      effect: {
        kind: "become",
        target: 0,
        power: 2,
        toughness: 2,
        addTypes: ["creature"],
        addSubtypes: ["Bat"],
        setColors: ["B"],
        keywords: ["flying", "haste"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Voldaren Bloodcaster", "Bloodbat Summoner"],
  transform: true,
});
