import { defineCard } from "../define.js";


export default defineCard({
  name: "Guard Change",
  art: "https://cards.scryfall.io/art_crop/back/a/c/ac1907e8-0713-47dd-ac42-bf1323c5bec0.jpg",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Create a Monster Role token attached to target creature you control. (Enchanted creature gets +1/+1 and has trample.)",
  targets: ["creature-you-control"],
  effect: { kind: "create-token", token: "Monster Role Token", count: 1, attachedTo: 0 },
  faces: ["Ferocious Werefox", "Guard Change"],
  adventure: true,
});
