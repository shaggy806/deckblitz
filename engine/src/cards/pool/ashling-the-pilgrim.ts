import { defineCard } from "../define.js";

const TEXT =
  "{1}{R}: Put a +1/+1 counter on Ashling. If this is the third time this ability has resolved this turn, remove all +1/+1 counters from Ashling, and it deals that much damage to each creature and each player.";

const COUNTERS = { countersOn: "source", counter: "+1/+1" } as const;

export default defineCard({
  name: "Ashling the Pilgrim",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            // "Remove all +1/+1 counters from Ashling": with Ashling gone,
            // none are removed, so "that much damage" is none.
            condition: { kind: "all", of: [{ kind: "resolved-this-turn", n: 3 }, { kind: "source-on-battlefield" }] },
            then: {
              kind: "sequence",
              // The damage is read off the counters before they come off, all
              // within one resolution: nothing can see the order in between
              // (state-based actions and triggers wait until it's done).
              effects: [
                {
                  kind: "sequence",
                  simultaneous: true,
                  effects: [
                    { kind: "damage-all", filter: { type: "creature" }, amount: COUNTERS },
                    { kind: "damage", amount: COUNTERS, who: "each-player" },
                  ],
                },
                { kind: "remove-counter", target: "source", counter: "+1/+1", amount: COUNTERS },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
