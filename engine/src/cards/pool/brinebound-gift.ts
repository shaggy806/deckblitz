import { defineCard } from "../define.js";

/** The disturb back face of Brine Comber, an Aura cast from the graveyard
 * targeting what it will enchant. "Enters or enchanted creature becomes the
 * target of an Aura spell" is one ability written as two entries
 * (`sameAbilityAs`); its "exile it instead" is the face's own ability
 * (`self`), as on Ancestor's Embrace. */
const TRIGGER_TEXT =
  "Whenever this Aura enters or enchanted creature becomes the target of an Aura spell, create a 1/1 white Spirit creature token with flying.";
const EXILE_TEXT = "If this Aura would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Brinebound Gift",
  art: "https://cards.scryfall.io/art_crop/back/8/d/8d233bc5-8a08-4d38-abd4-21a112141afd.jpg",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TRIGGER_TEXT}\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "becomes-target", who: "attached", spellFilter: { subtype: "Aura" } },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  faces: ["Brine Comber", "Brinebound Gift"],
  transform: true,
  disturb: { cost: "{W}{U}" },
});
