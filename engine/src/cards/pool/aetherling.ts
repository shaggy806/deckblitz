import { defineCard } from "../define.js";

// EDHREC rank 15974.
//
// Rulings:
//   [2013-04-15] Aetherling's first ability will return it to the battlefield only if that ability
//     also exiled it. If Aetherling left the battlefield in response to that ability, it won't
//     return, even if it was exiled by another spell or ability.
//   [2013-04-15] Aetherling's last ability can be activated even if its power is 0 or less. If a
//     creature would assign 0 or less damage in combat, it doesn't assign combat damage at all.
//
// Stenn, Paranoid Partisan's delayed flicker; Blockade Runner; Breathstealer; Morphling.

export default defineCard({
  name: "Aetherling",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 4,
  toughness: 5,
  text: "{U}: Exile this creature. Return it to the battlefield under its owner's control at the beginning of the next end step.\n{U}: This creature can't be blocked this turn.\n{1}: This creature gets +1/-1 until end of turn.\n{1}: This creature gets -1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: {
        kind: "flicker",
        target: "source",
        returnAt: "next-end-step",
        returnText: "Return Aetherling to the battlefield under its owner's control.",
      },
      resolve: null,
      text: "{U}: Exile this creature. Return it to the battlefield under its owner's control at the beginning of the next end step.",
    },
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{U}: This creature can't be blocked this turn.",
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}: This creature gets +1/-1 until end of turn.",
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: -1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}: This creature gets -1/+1 until end of turn.",
    },
  ],
});
