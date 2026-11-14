import { defineCard } from "../define.js";

// Outlaws of Thunder Junction (OTJ). The trigger reads the creature's
// toughness as the damage is dealt, damage already marked on it aside (the
// ruling). The {X} ability makes a replacement for the turn, X fixed as it
// resolves; the extra damage is the original source's (the ruling), and the
// affected player orders it among other modifiers (rule 616.1).

const DRAW_TEXT =
  "Whenever a source you control deals noncombat damage to a creature equal to that creature's toughness, draw a card.";
const PLUS_TEXT =
  "{X}, {T}: If a source you control would deal noncombat damage to a permanent or player this turn, it deals that much damage plus X instead.";

export default defineCard({
  name: "Taii Wakeen, Perfect Shot",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 2,
  toughness: 3,
  text: `${DRAW_TEXT}\n${PLUS_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", to: "creature", combat: false, equalToToughness: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        replacement: {
          event: "would-deal-damage",
          instead: { modify: { plus: "x" } },
          combat: false,
          source: { controlledBy: "you" },
        },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
  ],
});
