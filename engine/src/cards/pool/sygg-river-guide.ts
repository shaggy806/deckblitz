import { defineCard } from "../define.js";

// EDHREC rank 18022.
const TEXT = "{1}{W}: Target Merfolk you control gains protection from the color of your choice until end of turn.";

export default defineCard({
  name: "Sygg, River Guide",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["islandwalk"],
  text: `Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Merfolk" } }],
      effect: { kind: "grant-protection", target: 0, from: { choose: "color" }, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
