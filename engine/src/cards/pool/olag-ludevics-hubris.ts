import { defineCard } from "../define.js";

// The back face of Ludevic, Necrogenius. Both halves of its ability apply as it
// transforms (rule 712.20), not after (the ruling): its controller chooses which
// creature card exiled with it it becomes a copy of (`copyOnTransform`) — its
// printed values, for good, whatever becomes of that card — and the +1/+1
// counters, one per creature card exiled with it, go on as it does. With none
// exiled with it, it's simply this 4/4 with no counters (the ruling). A copy of
// another transforming card that transforms again stays that copy (the ruling).

const TEXT =
  "As this creature transforms into Olag, Ludevic's Hubris, it becomes a copy of a creature card exiled with it, except its name is Olag, Ludevic's Hubris, it's 4/4, and it's a legendary blue and black Zombie in addition to its other colors and types. Put a number of +1/+1 counters on Olag equal to the number of creature cards exiled with it.";

export default defineCard({
  name: "Olag, Ludevic's Hubris",
  art: "https://cards.scryfall.io/art_crop/back/7/8/788288f6-7944-48f4-91b0-f452e209c9ce.jpg",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 4,
  text: TEXT,
  copyOnTransform: {
    filter: { type: "creature" },
    except: {
      name: "Olag, Ludevic's Hubris",
      power: 4,
      toughness: 4,
      addSupertypes: ["legendary"],
      addColors: ["U", "B"],
      addSubtypes: ["Zombie"],
    },
  },
  asTransformsInto: {
    kind: "add-counter",
    target: "source",
    counter: "+1/+1",
    amount: { aggregate: "count", filter: { type: "creature" }, in: "exiled-with-source" },
  },
  faces: ["Ludevic, Necrogenius", "Olag, Ludevic's Hubris"],
  transform: true,
});
