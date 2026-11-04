import { defineCard } from "../define.js";

// Zendikar Rising. The middle ability is detain in all but name (no abilities
// activated, mana abilities included — the ruling; a noncreature target stays
// bound if it becomes a creature later); it keeps lasting after the party
// breaks or Linvala leaves, and until your next turn would have begun once
// you've left (the rulings, rule 800.4m). The keyword is chosen as the sacrifice
// ability resolves — an unannounced `modal`.
const COMBAT_TEXT =
  "At the beginning of combat on your turn, if you have a full party, choose target nonland permanent an opponent controls. Until your next turn, it can't attack or block, and its activated abilities can't be activated.";
const SACRIFICE_TEXT =
  "Sacrifice Linvala: Choose hexproof or indestructible. Creatures you control gain that ability until end of turn.";
const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Linvala, Shield of Sea Gate",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${COMBAT_TEXT}\n${SACRIFICE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Hexproof",
            effect: { kind: "grant-keyword-all", filter: YOURS, keyword: "hexproof", duration: "end-of-turn" },
          },
          {
            text: "Indestructible",
            effect: { kind: "grant-keyword-all", filter: YOURS, keyword: "indestructible", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "full-party" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["cant-attack", "cant-block"], duration: "until-your-next-turn" },
          { kind: "prohibit", target: 0, abilities: true, duration: "until-your-next-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
