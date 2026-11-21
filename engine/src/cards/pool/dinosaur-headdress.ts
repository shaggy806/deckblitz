import { defineCard } from "../define.js";

// The back face of Paleontologist's Pick-Axe. Each time it becomes attached
// (`asBecomesAttached`, rule 614.1e's timing — however it does: its enters
// trigger, equip), its controller chooses a creature card among those exiled
// to craft it (`"exiled-with-source"` — the cards linked to it, rule 607.2a,
// carried over from the Pick-Axe by `craft-return`), and it keeps that card's
// copiable values as the last chosen (`note` `copyOf`). "Equipped creature is
// a copy of the last chosen card" is then a copy effect on its host (layer 1,
// rule 707.2 — `copyOfChosen`), begun as it becomes attached and ending as it
// comes off. With no creature card left among them (a token was a material,
// or the cards left exile), nothing is chosen and the last choice stands.

const ENTER_TEXT = "When this Equipment enters, attach it to target creature you control.";
const AS_ATTACHED_TEXT =
  "As this Equipment becomes attached to a creature, choose an exiled creature card used to craft this Equipment.";
const COPY_TEXT = "Equipped creature is a copy of the last chosen card.";

export default defineCard({
  name: "Dinosaur Headdress",
  art: "https://cards.scryfall.io/art_crop/back/e/0/e08c0cf4-3669-4a9a-aa12-7e8fe0f063ad.jpg",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${AS_ATTACHED_TEXT}\n${COPY_TEXT}\nEquip {2}`,
  asBecomesAttached: {
    effect: {
      kind: "look-and-choose",
      zone: "exiled-with-source",
      filter: { type: "creature" },
      min: 1,
      max: 1,
      destination: "stay",
      leftover: "stay",
      prompt: "Choose an exiled creature card used to craft this Equipment",
      then: { kind: "note", copyOf: 0 },
    },
  },
  static: [{ affects: { scope: "attached" }, copyOfChosen: true, text: COPY_TEXT }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
