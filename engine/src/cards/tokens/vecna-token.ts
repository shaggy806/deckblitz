import { defineCard } from "../define.js";

/** Vecna, a legendary 8/8 black Zombie God creature token with indestructible
 * (The Book of Vile Darkness, which gives it the exiled cards' triggered
 * abilities as it's made — `create-token`'s `withTriggeredOf`). Keyed
 * " Token" and named by `tokenName`, so the legend rule and Hand of Vecna's
 * "a creature you control named Vecna" read "Vecna". */
export default defineCard({
  name: "Vecna Token",
  tokenName: "Vecna",
  art: "86881c5f-df5e-4f50-b554-e4c49d5316f9",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "God"],
  power: 8,
  toughness: 8,
  keywords: ["indestructible"],
  text: "Indestructible",
});
