import { defineCard } from "../define.js";

// EDHREC rank 15381.
// The devotion is read as the trigger's targets are chosen, and the count is locked in from then
// on (the ruling).

const TRIGGER_TEXT =
  "When this creature enters, up to X target creatures each gain intimidate and haste until end of turn, where X is your devotion to black.";

export default defineCard({
  name: "Mogis's Marauder",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, up to X target creatures each gain intimidate and haste until end of turn, where X is your devotion to black. (A creature with intimidate can't be blocked except by artifact creatures and/or creatures that share a color with it. Each {B} in the mana costs of permanents you control counts toward your devotion to black.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature", max: { devotionTo: "B" } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "intimidate", duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
