import { defineCard } from "../define.js";

/** The Scryb Sprites token (Worzel, the Protector): a copy of the card Scryb
 * Sprites — named Scryb Sprites, its {G} mana cost and all. */
export default defineCard({
  name: "Scryb Sprites Token",
  tokenName: "Scryb Sprites",
  art: "26f191de-8c59-458c-a1ab-80e2bccdb974",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n(This token's mana cost is {G}.)",
});
