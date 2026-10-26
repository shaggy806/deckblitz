import { defineCard } from "../define.js";

// EDHREC rank 19571. Crash Through's trample grant; Clan Guildmage's land
// animation, without haste.
//
// Rulings:
//   [2013-01-24] Only creatures you control when the first ability resolves will gain trample.
//     Creatures that come under your control later in the turn won’t have trample. Lands you
//     control that aren’t creatures also won’t gain trample, even if you use the second ability to
//     turn them into creatures later in the turn.
//   [2013-01-24] Skarrg Guildmage’s second ability doesn’t affect the land’s name or any other
//     types, subtypes, or supertypes (such as basic or legendary) the land may have. The land will
//     also keep any abilities it had.

export default defineCard({
  name: "Skarrg Guildmage",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: "{R}{G}: Creatures you control gain trample until end of turn.\n{1}{R}{G}: Target land you control becomes a 4/4 Elemental creature until end of turn. It's still a land.",
  activated: [
    {
      cost: { mana: "{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "trample",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{R}{G}: Creatures you control gain trample until end of turn.",
    },
    {
      cost: { mana: "{1}{R}{G}", tap: false },
      targets: ["land-you-control"],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}{R}{G}: Target land you control becomes a 4/4 Elemental creature until end of turn. It's still a land.",
    },
  ],
});
