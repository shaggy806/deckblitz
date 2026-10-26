import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 18534. Morningtide.
//
// Rulings:
//   [2008-04-01] "Whenever a [creature type] creature enters, you may attach [this Equipment] to
//     it." This triggers whenever any creature of the specified creature type enters, no matter
//     who controls it. You may attach your Equipment to another player's creature this way, even
//     though you can't do so with the equip ability.
//
// The granted "attacks or blocks" trigger is two triggers (Spider-Mobile's
// shape), counting every attacking creature as it resolves. The attach
// trigger is `who: "any"` (the ruling).
const GRANTED =
  "Whenever this creature attacks or blocks, it gets +1/+1 until end of turn for each attacking creature.";
const STATIC = `Equipped creature has "${GRANTED}"`;
const ATTACH_TEXT = "Whenever a Soldier creature enters, you may attach this Equipment to it.";

const ATTACKERS = { countOf: { type: "creature", attacking: true } } as const;
const pump: EffectSpec = {
  kind: "modify-pt",
  target: "source",
  power: ATTACKERS,
  toughness: ATTACKERS,
  duration: "end-of-turn",
};

export default defineCard({
  name: "Veteran's Armaments",
  manaCost: "{2}",
  colors: [],
  types: ["kindred", "artifact"],
  subtypes: ["Soldier", "Equipment"],
  text: `${STATIC}\n${ATTACH_TEXT}\nEquip {2}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature", subtype: "Soldier" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Attach Veteran's Armaments to it?",
        effect: { kind: "attach", target: "trigger-object" },
      },
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        { trigger: { on: "attacks", who: "self" }, targets: [], effect: pump, resolve: null, text: GRANTED },
        { trigger: { on: "blocks", who: "self" }, targets: [], effect: pump, resolve: null, text: GRANTED },
      ],
      text: STATIC,
    },
  ],
});
