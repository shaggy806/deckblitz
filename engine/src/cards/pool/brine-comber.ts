import { defineCard } from "../define.js";

// Innistrad: Crimson Vow. EDHREC rank 21110.
//
// Disturb (rule 702.146): cast the front face normally, or the back face
// (`Brinebound Gift`, an Aura) from your graveyard for its disturb cost.
// "Enters or becomes the target of an Aura spell" is one ability written as
// two entries (`sameAbilityAs`); an Aura spell is the spell as it is on the
// stack (`spellFilter`), never an ability.

const TEXT =
  "Whenever this creature enters or becomes the target of an Aura spell, create a 1/1 white Spirit creature token with flying.";

export default defineCard({
  name: "Brine Comber",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: `${TEXT}\nDisturb {W}{U} (You may cast this card from your graveyard transformed for its disturb cost.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "becomes-target", who: "self", spellFilter: { subtype: "Aura" } },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Brine Comber", "Brinebound Gift"],
  transform: true,
  disturb: { cost: "{W}{U}" },
});
