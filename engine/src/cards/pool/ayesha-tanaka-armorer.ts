import { defineCard } from "../define.js";

// EDHREC rank 19910.
//
// Her power is read once, as the trigger resolves, as it last existed if she has
// left, and each artifact is compared with it on its own (the rulings).

const ATTACK_TEXT =
  "Whenever Ayesha Tanaka attacks, look at the top four cards of your library. You may put any number of artifact cards with mana value less than or equal to Ayesha Tanaka's power from among them onto the battlefield tapped. Put the rest on the bottom of your library in a random order.";
const UNBLOCKABLE_TEXT = "Ayesha Tanaka can't be blocked as long as defending player controls three or more artifacts.";

export default defineCard({
  name: "Ayesha Tanaka, Armorer",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${UNBLOCKABLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 0,
        max: 4,
        filter: { type: "artifact", manaValue: { op: "lte", n: { amount: { powerOf: "source" } } } },
        destination: "battlefield",
        enterTapped: true,
        leftover: "bottom-random",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "of-player",
        player: "defending-player",
        condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 3 },
      },
      grantKeywords: ["unblockable"],
      text: UNBLOCKABLE_TEXT,
    },
  ],
});
