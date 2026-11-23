import { defineCard } from "../define.js";

const BLOCKED_TEXT = "Whenever equipped creature becomes blocked, each creature blocking it gets -5/-5 until end of turn.";
const DAMAGE_TEXT =
  "Whenever equipped creature deals combat damage to an opponent, you may search your library for a Praetor card, reveal it, and put it into your hand. Then shuffle.";

export default defineCard({
  name: "Bob the Claymore",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${BLOCKED_TEXT}\n${DAMAGE_TEXT}\nEquip {3}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "attached" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", blockingRelation: { relation: "blocking", of: "trigger-object" } },
        power: -5,
        toughness: -5,
        duration: "end-of-turn",
      },
      resolve: null,
      text: BLOCKED_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached", toOpponent: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Praetor card?",
        effect: { kind: "search-library", filter: { subtype: "Praetor" }, destination: "hand", reveal: true, min: 0, max: 1 },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
