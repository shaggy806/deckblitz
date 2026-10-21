import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Dovin, Architect of Law" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Dovin's Dismissal",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Put up to one target tapped creature on top of its owner's library. You may search your library and/or graveyard for a card named Dovin, Architect of Law, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature", tapped: true } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-library", target: 0, position: "top" },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Dovin, Architect of Law?",
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            { text: "Search your library and graveyard", effect: search("library-and-graveyard") },
            { text: "Search your library", effect: search("library") },
            { text: "Search your graveyard", effect: search("graveyard") },
          ],
        },
      },
    ],
  },
});
