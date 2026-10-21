import { defineCard } from "../define.js";

// Animating Faerie's Adventure. "Becomes a 0/0 artifact creature" lasts
// indefinitely (the ruling) and sets its base power and toughness (layer 7b),
// which the four +1/+1 counters then raise.

export default defineCard({
  name: "Bring to Life",
  art: "https://cards.scryfall.io/art_crop/back/3/2/32158458-42eb-41bc-a15a-11af28463eb0.jpg",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Target noncreature artifact you control becomes a 0/0 artifact creature. Put four +1/+1 counters on it. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact", notTypes: ["creature"] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: 0,
        power: 0,
        toughness: 0,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        duration: "permanent",
      },
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 4 },
    ],
  },
  faces: ["Animating Faerie", "Bring to Life"],
  adventure: true,
});
