import { defineCard } from "../define.js";

// The enters ability's group is bounded by how
// many times Zethi was kicked, read as the trigger goes on the stack (0 when it
// wasn't cast). The copies are made in exile, counterless (rule 707.12), each its
// own "may" (707.12a), paid for as usual; one not cast ceases to exist (704.5e).
const ENTERS_TEXT =
  "When Zethi, Arcane Blademaster enters, exile up to X target instant cards from your graveyard, where X is the number of times Zethi was kicked. Put a kick counter on each of them.";
const ATTACK_TEXT =
  "Whenever Zethi attacks, copy each exiled card you own with a kick counter on it. You may cast the copies.";

export default defineCard({
  name: "Zethi, Arcane Blademaster",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  supertypes: ["legendary"],
  power: 3,
  toughness: 3,
  text: `Multikicker {W/U} (You may pay an additional {W/U} any number of times as you cast this spell.)\n${ENTERS_TEXT}\n${ATTACK_TEXT}`,
  kicker: { cost: "{W/U}", multi: true },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "instant" } },
          max: { timesKicked: "source" },
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "exile", target: 0, withCounters: { kind: "kick", amount: 1 } },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "cast-now", from: { exiledOwnedWithCounter: "kick" }, copies: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
