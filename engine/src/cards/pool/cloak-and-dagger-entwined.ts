import { defineCard } from "../define.js";

const TEXT =
  "When Cloak and Dagger enter, choose target opponent and up to one target creature they control. They reveal their hand. You may exile a nonland card from their hand or the chosen creature until Cloak and Dagger leave the battlefield.";

// One choice over the revealed hand's nonland cards and the targeted creature
// (`alsoFrom: { zone: "target" }`). "Until … leave" is rule 610.3: a one-shot
// return, the creature to the battlefield and a card to its owner's hand.
export default defineCard({
  name: "Cloak and Dagger, Entwined",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch", "lifelink"],
  text: `Deathtouch, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        "opponent",
        { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 }, sameController: true } },
      ],
      effect: {
        kind: "discard-chosen",
        target: 0,
        filter: { notTypes: ["land"] },
        optional: true,
        destination: "exile",
        untilSourceLeaves: true,
        alsoFrom: { zone: "target", slot: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
