import { defineCard } from "../define.js";

// The back face of Kytheon, Hero of Akros (kytheon-hero-of-akros.ts).
const PLUS_TWO = "+2: Up to one target creature an opponent controls attacks Gideon during its controller's next turn if able.";
const PLUS_ONE = "+1: Until your next turn, target creature gains indestructible. Untap that creature.";
const ZERO =
  "0: Until end of turn, Gideon becomes a 4/4 Human Soldier creature with indestructible that's still a planeswalker. Prevent all damage that would be dealt to him this turn.";

export default defineCard({
  name: "Gideon, Battle-Forged",
  art: "https://cards.scryfall.io/art_crop/back/5/8/58c39df6-b237-40d1-bdcb-2fe5d05392a9.jpg",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Gideon"],
  loyalty: 3,
  text: `${PLUS_TWO}\n${PLUS_ONE}\n${ZERO}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: { kind: "attack-requirement", target: 0, attacks: "source", duration: "during-its-controllers-next-turn" },
      resolve: null,
      text: PLUS_TWO,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "until-your-next-turn" },
          { kind: "untap", target: 0 },
        ],
      },
      resolve: null,
      text: PLUS_ONE,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 4,
            toughness: 4,
            addTypes: ["creature"],
            addSubtypes: ["Human", "Soldier"],
            keywords: ["indestructible"],
            duration: "end-of-turn",
          },
          { kind: "prevent-damage", target: "source", amount: "all" },
        ],
      },
      resolve: null,
      text: ZERO,
    },
  ],
  faces: ["Kytheon, Hero of Akros", "Gideon, Battle-Forged"],
  transform: true,
});
