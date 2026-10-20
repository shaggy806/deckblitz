import { defineCard } from "../define.js";

const CORRUPTED = { counters: { kind: "corruption", compare: { op: "gte" as const, n: 1 } } };

// Protection from a quality a colour or type can't name is the protection
// `filter` (Yawgmoth's shape): only a permanent can have counters, so it
// matches exactly the permanents with a corruption counter — read live, and
// from any Dihada (the counters stay after she leaves, the ruling).
export default defineCard({
  name: "Geyadrone Dihada",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Dihada"],
  loyalty: 4,
  text: "Protection from permanents with corruption counters on them\n+1: Each opponent loses 2 life and you gain 2 life. Put a corruption counter on up to one other target creature or planeswalker.\n−3: Gain control of target creature or planeswalker until end of turn. Untap it and put a corruption counter on it. It gains haste until end of turn.\n−7: Gain control of each permanent with a corruption counter on it.",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: CORRUPTED },
      text: "Protection from permanents with corruption counters on them",
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
          { kind: "add-counter", target: 0, counter: "corruption", amount: 1 },
        ],
      },
      resolve: null,
      text: "+1: Each opponent loses 2 life and you gain 2 life. Put a corruption counter on up to one other target creature or planeswalker.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "add-counter", target: 0, counter: "corruption", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "−3: Gain control of target creature or planeswalker until end of turn. Untap it and put a corruption counter on it. It gains haste until end of turn.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "gain-control-all", filter: CORRUPTED, untilEndOfTurn: false },
      resolve: null,
      text: "−7: Gain control of each permanent with a corruption counter on it.",
    },
  ],
});
