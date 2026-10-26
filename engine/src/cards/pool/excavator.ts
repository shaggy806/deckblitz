import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 26983. The sacrificed land's types are read as
// it last existed (rule 608.2h — the `sacrificed` condition), so a basic land
// that was also a Swamp under Urborg gives swampwalk too, and one with several
// types gives each (the 2005-11-01 ruling). Wastes has no land type and gives
// nothing.

const TEXT =
  "{T}, Sacrifice a basic land: Target creature gains landwalk of each of the land types of the sacrificed land until end of turn.";

const WALKS = [
  ["Plains", "plainswalk"],
  ["Island", "islandwalk"],
  ["Swamp", "swampwalk"],
  ["Mountain", "mountainwalk"],
  ["Forest", "forestwalk"],
  ["Desert", "desertwalk"],
] as const;

export default defineCard({
  name: "Excavator",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT} (It can't be blocked as long as defending player controls a land of any of those types.)`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "land", supertype: "basic" } } },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: WALKS.map(([landType, keyword]) => ({
          kind: "conditional" as const,
          condition: { kind: "sacrificed" as const, filter: { subtype: landType } },
          then: { kind: "grant-keyword" as const, target: 0, keyword, duration: "end-of-turn" as const },
        })),
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
