import { defineCard } from "../define.js";

/** 1/1 blue Ninja with "This token can't be blocked." — Kaito Shizuki's token. */
export default defineCard({
  name: "Ninja Token (Kaito Shizuki)",
  art: "14eb629e-f09f-4deb-b434-7615a3010a4d",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Ninja"],
  power: 1,
  toughness: 1,
  keywords: ["unblockable"],
  text: "This token can't be blocked.",
});
