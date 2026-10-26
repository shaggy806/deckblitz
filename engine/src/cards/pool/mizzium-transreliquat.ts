import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 24194.
//
// Mirage Mirror's until-end-of-turn copy and Thespian's Stage's lasting one
// ("except it has this ability" — the second activated ability, index 1).

export default defineCard({
  name: "Mizzium Transreliquat",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{3}: This artifact becomes a copy of target artifact until end of turn.\n{1}{U}{R}: This artifact becomes a copy of target artifact, except it has this ability.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["artifact"],
      effect: { kind: "become-copy", target: "source", of: 0, until: "end-of-turn" },
      resolve: null,
      text: "{3}: This artifact becomes a copy of target artifact until end of turn.",
    },
    {
      cost: { mana: "{1}{U}{R}", tap: false },
      targets: ["artifact"],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        exceptions: { thisAbility: { card: "Mizzium Transreliquat", activated: 1 } },
      },
      resolve: null,
      text: "{1}{U}{R}: This artifact becomes a copy of target artifact, except it has this ability.",
    },
  ],
});
