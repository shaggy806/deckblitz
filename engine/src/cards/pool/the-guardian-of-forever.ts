import { defineCard } from "../define.js";

// EDHREC rank 28015.

const TEXT =
  "{4}, Sacrifice another nontoken creature: Return that card to the battlefield under its owner's control at the beginning of the next end step.";

// The delayed ability (rule 603.7) remembers the card the cost put into the
// graveyard, as it is there: once it has left that graveyard it's a new
// object (400.7) and isn't returned.
export default defineCard({
  name: "The Guardian of Forever",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 6,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false, sacrifice: { filter: { token: false, type: "creature" } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end" },
        remember: { returned: { set: { paid: "sacrificed" } } },
        effect: { kind: "put-onto-battlefield", target: { remembered: "returned" } },
        text: "Return that card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
