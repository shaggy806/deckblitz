import { defineCard } from "../define.js";

/** 3/3 green Phyrexian Beast creature token with toxic 1 — Lukka, Bound to
 * Ruin's. */
export default defineCard({
  name: "Phyrexian Beast Token",
  art: "919381b0-2d23-4794-b4ff-923c23e18196",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 3,
  toughness: 3,
  toxic: 1,
  text: "Toxic 1 (Players dealt combat damage by this creature also get a poison counter.)",
});
