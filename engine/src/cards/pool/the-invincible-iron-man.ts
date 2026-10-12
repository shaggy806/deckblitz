import { defineCard } from "../define.js";

// The back face of Tony Stark, castable on its own. The artifact put onto the
// battlefield isn't a target: it's the look-and-choose's chosen card (slot 0
// of its `then`), attached only if it's an Equipment and Iron Man is still
// here to take it (rule 301.5c).
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may put an artifact card from your hand onto the battlefield. If it's an Equipment, attach it to The Invincible Iron Man.";

export default defineCard({
  name: "The Invincible Iron Man",
  art: "https://cards.scryfall.io/art_crop/back/4/c/4cea42fd-035e-4b8f-8b1d-ff363b694f14.jpg",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        filter: { type: "artifact" },
        destination: "battlefield",
        leftover: "stay",
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { subtype: "Equipment" } },
          then: { kind: "attach", target: "source", attachment: 0 },
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  faces: ["Tony Stark", "The Invincible Iron Man"],
});
