import { defineCard } from "../define.js";

// Body Double's `copyOnEnter` from graveyards, with the exception as part of the copy
// (rule 707.9b): a 4/4, black and a Zombie besides what it copies.

const TEXT =
  "You may have this creature enter as a copy of any creature card in a graveyard, except it's a 4/4 black Zombie in addition to its other colors and types.";

export default defineCard({
  name: "Lazotep Convert",
  art: "https://cards.scryfall.io/art_crop/back/9/8/981f091a-17f8-412e-9752-69070ebed4ea.jpg",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 4,
  text: TEXT,
  copyOnEnter: {
    filter: { type: "creature" },
    from: "graveyards",
    except: { power: 4, toughness: 4, addColors: ["B"], addSubtypes: ["Zombie"] },
  },
  faces: ["Invasion of Amonkhet", "Lazotep Convert"],
  transform: true,
});
