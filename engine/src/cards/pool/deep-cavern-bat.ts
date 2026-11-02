import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. A look, not a reveal; "you may exile" is optional.
// Rule 610.3, as Kitesail Freebooter's: with the Bat gone you still look (the
// ruling).

const TEXT =
  "When this creature enters, look at target opponent's hand. You may exile a nonland card from it until this creature leaves the battlefield.";

export default defineCard({
  name: "Deep-Cavern Bat",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${TEXT}`,
  triggered: [
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
        untilSourceLeaves: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
