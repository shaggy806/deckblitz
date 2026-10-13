import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 7049.
// Makes Satyr Tokens. Its power is a CDA (rule 604.3) that works in every zone
// (the ruling): its controller's devotion to red, its own {R}{R} included.
//
// Rulings:
//   [2020-01-24] If you put an Aura on an opponent's permanent, you still control the Aura, and
//     mana symbols in its mana cost count towards your devotion.
//   [2020-01-24] If you create a token that's a copy of Anax, its last ability triggers when it
//     dies.
//   [2020-01-24] If Anax dies at the same time as another nontoken creature you control, its
//     ability triggers for each of them.
//   [2020-01-24] Mana symbols in the text boxes of permanents you control don't count toward your
//     devotion to any color.
//   [2020-01-24] The ability that defines Anax's power works in all zones, not just the
//     battlefield.
//   [2020-01-24] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it's still on the battlefield at that time.
//   [2020-01-24] Colorless and generic mana symbols ({C}, {0}, {1}, {2}, {X}, and so on) in mana
//     costs of permanents you control don't count toward your devotion to any color.
//   [2020-01-24] To determine whether you create two tokens, check the power of the creature that
//     died immediately before it died.
//   [2020-01-24] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).

const DIES_TEXT =
  "Whenever Anax or another nontoken creature you control dies, create a 1/1 red Satyr creature token with \"This token can't block.\" If the creature had power 4 or greater, create two of those tokens instead.";
const SATYRS = {
  kind: "conditional",
  condition: { kind: "trigger-object", filter: { power: { op: "gte", n: 4 } } },
  then: { kind: "create-token", token: "Satyr Token", count: 2 },
  else: { kind: "create-token", token: "Satyr Token", count: 1 },
} as const satisfies EffectSpec;

export default defineCard({
  name: "Anax, Hardened in the Forge",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["Demigod"],
  power: 0,
  toughness: 3,
  text: "Anax's power is equal to your devotion to red. (Each {R} in the mana costs of permanents you control counts toward your devotion to red.)\nWhenever Anax or another nontoken creature you control dies, create a 1/1 red Satyr creature token with \"This token can't block.\" If the creature had power 4 or greater, create two of those tokens instead.",
  triggered: [
    // "Anax or another": Anax itself (a token copy of it too — the ruling),
    // and each other nontoken creature you control. The power is the one it
    // had immediately before it died (608.2h, the ruling).
    { trigger: { on: "dies", who: "self" }, targets: [], effect: SATYRS, resolve: null, text: DIES_TEXT },
    {
      trigger: { on: "dies", who: "you-control", filter: { token: false, type: "creature" }, otherOnly: true },
      targets: [],
      effect: SATYRS,
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { devotionTo: ["R"] }, plusPower: 0, plusToughness: 0, only: "power" },
      text: "Anax's power is equal to your devotion to red.",
    },
  ],
});
