import { defineCard } from "../define.js";

// EDHREC rank 12316.

const TEXT =
  "Landfall — Whenever a land you control enters, draw a card. Then if this is the first time this ability has resolved this turn, reveal cards from the top of your library until you reveal a creature card. Put that card onto the battlefield and the rest on the bottom of your library in a random order.";

// Nissa, Resurgent Animist's shape: the count is this ability's resolutions
// this turn, the one under way included, so the first is `n: 1`; later ones
// only draw. With no creature card left, every revealed card goes to the
// bottom.
export default defineCard({
  name: "Nissa, Leyline Tamer",
  manaCost: "{3}{W}{U}{B}{R}",
  colors: ["W", "U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 5,
  toughness: 5,
  keywords: ["deathtouch", "vigilance"],
  text: `Deathtouch, vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 1 },
            then: { kind: "reveal-until", filter: { type: "creature" }, put: "battlefield", rest: "bottom-random" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
