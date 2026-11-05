import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this Siege enters, look at target opponent's hand. You may exile a nonland card from it. For as long as that card remains exiled, its owner may play it. A spell cast this way costs {2} more to cast.";

export default defineCard({
  name: "Invasion of Gobakhan",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 3,
  text: `(As a Siege enters, choose an opponent to protect it. You and others can attack it. When it's defeated, exile it, then cast it transformed.)\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "defense", last: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "source" },
          { kind: "cast-now", from: "source-exiled-this-way", free: true, transformed: true },
        ],
      },
      resolve: null,
      text: "When the last defense counter is removed from this permanent, exile it, then you may cast it transformed without paying its mana cost.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "discard-chosen",
        target: 0,
        filter: { notTypes: ["land"] },
        lookOnly: true,
        optional: true,
        destination: "exile",
        unlinked: true,
        mayCast: { duration: "while-exiled", play: true, byOwner: true, tax: { generic: 2 } },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  faces: ["Invasion of Gobakhan", "Lightshield Array"],
  transform: true,
});
