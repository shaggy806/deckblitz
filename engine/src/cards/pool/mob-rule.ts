import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Rulings:
//   [2014-11-24] Mob Rule can affect creatures you already control or ones that are already untapped.
//     It will untap them if applicable and give them haste.
//   [2014-11-24] You choose which mode you're using as you cast Mob Rule. Once it's cast, you can't
//     change its mode, even if creatures' powers change in response.
//   [2014-11-24] Gaining control of a creature doesn't cause you to gain control of any Auras or
//     Equipment attached to it.
//   [2014-11-24] Once you gain control of a creature, it doesn't matter what happens to its power.
const takeAll = (power: { readonly op: "gte" | "lte"; readonly n: number }): EffectSpec => ({
  kind: "sequence",
  effects: [
    { kind: "gain-control-all", filter: { type: "creature", power }, untilEndOfTurn: true },
    // "Those creatures": the ones already yours too (the ruling), whatever
    // their power has become since.
    { kind: "untap-all", filter: { thisWay: "control-effect" } },
    { kind: "grant-keyword-all", filter: { thisWay: "control-effect" }, keyword: "haste", duration: "end-of-turn" },
  ],
});

export default defineCard({
  name: "Mob Rule",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one —\n• Gain control of all creatures with power 4 or greater until end of turn. Untap those creatures. They gain haste until end of turn.\n• Gain control of all creatures with power 3 or less until end of turn. Untap those creatures. They gain haste until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Gain control of all creatures with power 4 or greater until end of turn. Untap those creatures. They gain haste until end of turn.",
        targets: [],
        effect: takeAll({ op: "gte", n: 4 }),
      },
      {
        text: "Gain control of all creatures with power 3 or less until end of turn. Untap those creatures. They gain haste until end of turn.",
        targets: [],
        effect: takeAll({ op: "lte", n: 3 }),
      },
    ],
  },
});
