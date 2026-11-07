import { defineCard } from "../define.js";

// Modern Horizons 3 Commander (M3C). Top-500 commander #33.
//
// Devoid is its colours (rule 702.114a: no colour in every zone), so it's
// colourless while its colour identity is still all five (the ruling). Each
// {C/W}-style symbol is paid with one colorless mana or one of its colour
// (rule 107.4e), mana value 1 each (202.3f).
//
// "Copy all spells you control, then copy all other activated and triggered
// abilities you control" is `copy-all` twice: the spells and abilities on the
// stack as it resolves, the trigger itself left out; with two or more to copy
// its controller picks which goes next, and chooses new targets for each. The
// copies aren't cast or activated (rule 707.10), and the Eldrazi spell that
// triggered it is copied too if it's still there.

const TEXT =
  "Whenever you cast an Eldrazi spell, you may pay {C}{C}. If you do, copy all spells you control, then copy all other activated and triggered abilities you control. You may choose new targets for the copies. (Mana abilities can't be copied.)";

export default defineCard({
  name: "Ulalek, Fused Atrocity",
  manaCost: "{C/W}{C/U}{C/B}{C/R}{C/G}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 2,
  toughness: 5,
  text: `Devoid (This card has no color.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Eldrazi" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {C}{C} to copy all spells and other abilities you control?",
        cost: "{C}{C}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "copy-all", what: "spells", newTargets: true },
            { kind: "copy-all", what: "other-abilities", newTargets: true },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
