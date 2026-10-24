import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 9065.
//
// "Dies" fires for any permanent put into a graveyard from the battlefield (rule 700.4), read
// as it last existed; owner, not controller, decides (the ruling). Mandatory draw and loss.
const TEXT =
  "Whenever a permanent owned by another player is put into a graveyard from the battlefield, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Kothophed, Soul Hoarder",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { ownedBy: "opponent" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
