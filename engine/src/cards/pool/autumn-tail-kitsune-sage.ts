import { defineCard } from "../define.js";

const TEXT = "{1}: Attach target Aura attached to a creature to another creature.";

// The other creature isn't targeted: it's chosen as this resolves, among
// those the Aura could legally enchant (rule 701.3a).
export default defineCard({
  name: "Autumn-Tail, Kitsune Sage",
  art: "https://cards.scryfall.io/art_crop/front/f/2/f2ddf1a3-e6fa-4dd0-b80d-1a585b51b934.jpg",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fox", "Wizard"],
  power: 4,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Aura", attachedTo: { type: "creature" } } }],
      effect: {
        kind: "attach",
        target: 0,
        attachment: 0,
        ontoChosen: { filter: { type: "creature" }, prompt: "Attach that Aura to another creature", another: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Kitsune Mystic", "Autumn-Tail, Kitsune Sage"],
  flip: true,
});
