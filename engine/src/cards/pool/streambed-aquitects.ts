import { defineCard } from "../define.js";

export default defineCard({
  name: "Streambed Aquitects",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 2,
  toughness: 3,
  text: "{T}: Target Merfolk creature gets +1/+1 and gains islandwalk until end of turn. (It can't be blocked as long as defending player controls an Island.)\n{T}: Target land becomes an Island until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Merfolk" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "islandwalk", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{T}: Target Merfolk creature gets +1/+1 and gains islandwalk until end of turn.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Island"], duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target land becomes an Island until end of turn.",
    },
  ],
});
