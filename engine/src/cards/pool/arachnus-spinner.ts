import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// "Your graveyard and/or library" is the player's choice of zones as it
// resolves (Finale of Devastation's shape); only a search that includes the
// library shuffles it. The Web enters attached to the target creature
// (`attachedTo: 0`): one that can't enchant it — the creature gone or turned
// illegal — stays where it was found (rule 303.4i).

const TEXT =
  "Tap an untapped Spider you control: Search your graveyard and/or library for a card named Arachnus Web and put it onto the battlefield attached to target creature. If you search your library this way, shuffle.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Arachnus Web" },
  destination: "battlefield",
  min: 0,
  max: 1,
  zones,
  attachedTo: 0,
});

export default defineCard({
  name: "Arachnus Spinner",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 5,
  toughness: 7,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { subtype: "Spider", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["creature"],
      // In a sequence, so the zones are chosen as it resolves — not modes
      // chosen as it's activated (rule 700.2b).
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [
              { text: "Search your graveyard and library", effect: search("library-and-graveyard") },
              { text: "Search your library", effect: search("library") },
              { text: "Search your graveyard", effect: search("graveyard") },
            ],
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
