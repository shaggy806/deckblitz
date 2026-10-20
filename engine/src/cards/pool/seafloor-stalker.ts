import { defineCard } from "../define.js";

// Rulings: the party is counted as the ability is activated; it may be
// activated again while it already can't be blocked, and once blocked it
// stays blocked.

const SNEAK =
  "{4}{U}: This creature gets +1/+0 until end of turn and can't be blocked this turn. This ability costs {1} less to activate for each creature in your party.";

export default defineCard({
  name: "Seafloor Stalker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 3,
  text: `${SNEAK} (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)`,
  activated: [
    {
      cost: { mana: "{4}{U}", tap: false },
      costReduction: { reduceGeneric: { partySize: "you" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SNEAK,
    },
  ],
});
