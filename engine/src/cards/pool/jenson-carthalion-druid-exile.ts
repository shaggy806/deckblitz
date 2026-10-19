import { defineCard } from "../define.js";

// "If that spell was all colors" asks the spell that fired the trigger (its
// colours as it was cast, or as it last was if it has left the stack).
const ALL_COLORS = ["W", "U", "B", "R", "G"] as const;

export default defineCard({
  name: "Jenson Carthalion, Druid Exile",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: "Whenever you cast a multicolored spell, scry 1. If that spell was all colors, create a 4/4 white Angel creature token with flying and vigilance.\n{5}, {T}: Add {W}{U}{B}{R}{G}.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { colors: ALL_COLORS } },
            then: { kind: "create-token", token: "4/4 Vigilant Angel Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: "Whenever you cast a multicolored spell, scry 1. If that spell was all colors, create a 4/4 white Angel creature token with flying and vigilance.",
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["W", "U", "B", "R", "G"] }, amount: 1 },
      resolve: null,
      text: "{5}, {T}: Add {W}{U}{B}{R}{G}.",
    },
  ],
});
