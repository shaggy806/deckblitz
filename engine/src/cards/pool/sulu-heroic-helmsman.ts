import { defineCard } from "../define.js";

// EDHREC rank 25768.

const TEXT = "Sulu stations Spacecraft and crews Vehicles as though his power were tripled.";

// His power is unchanged for anything else; tapped to station, the counters
// are read as the station ability resolves (rule 702.184a), and a crew cost
// counts him as three times his power as it's paid (702.122a).
export default defineCard({
  name: "Sulu, Heroic Helmsman",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "self" }, crewsAs: { times: 3, stations: true }, text: TEXT }],
});
