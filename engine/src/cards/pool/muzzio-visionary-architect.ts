import { defineCard } from "../define.js";

// Conspiracy (CNS). EDHREC rank 13626.
//
// X is read as the ability resolves; with no artifacts it looks at nothing
// (the ruling).

const TEXT =
  "{3}{U}, {T}: Look at the top X cards of your library, where X is the greatest mana value among artifacts you control. You may put an artifact card from among them onto the battlefield. Put the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Muzzio, Visionary Architect",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: { aggregate: "max", of: "mana-value", filter: { type: "artifact", controlledBy: "you" } },
        min: 0,
        max: 1,
        filter: { type: "artifact" },
        destination: "battlefield",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
