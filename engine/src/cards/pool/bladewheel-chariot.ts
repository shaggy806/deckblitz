import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// "Tap two other untapped artifacts you control" is Voyager Glidecar's
// `tapOthers` (the Vehicle itself never one of them, untapped or not); it
// isn't crewing, so it doesn't crew the Vehicle.
const ANIMATE_TEXT = "Tap two other untapped artifacts you control: This Vehicle becomes an artifact creature until end of turn.";

export default defineCard({
  name: "Bladewheel Chariot",
  art: "https://cards.scryfall.io/art_crop/back/2/4/24417388-f2bb-4783-bdce-264774531838.jpg",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  text: `${ANIMATE_TEXT}\n${crewText(1)}`,
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 2, filter: { type: "artifact", controlledBy: "you" } } },
      targets: [],
      effect: { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      text: ANIMATE_TEXT,
    },
    crew(1),
  ],
  faces: ["Spring-Loaded Sawblades", "Bladewheel Chariot"],
  transform: true,
});
