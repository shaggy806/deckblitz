import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 13076.
//
// Thraben Heretic's exile, then Shadow Kin's copy of "that card" (`ofCard`:
// its printed values) keeping this ability (`thisAbility`, activated 0), with
// no duration — a later copy overwrites it (the first ruling).

const TEXT =
  "{1}{U}{B}: Exile target creature card from a graveyard. This creature becomes a copy of that card, except it has this ability.";

export default defineCard({
  name: "Dimir Doppelganger",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{U}{B}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "become-copy",
            target: "source",
            of: 0,
            ofCard: true,
            exceptions: { thisAbility: { card: "Dimir Doppelganger", activated: 0 } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
