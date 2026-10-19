/**
 * Domain (an ability word, rule 207.2c): "the number of basic land types among lands you control"
 * — `{ basicLandTypes: "you" }` as an effect amount (Meria's Outrider), a spell's and an
 * ability's cost reduction (Yavimaya Sojourner, Jodah's Codex) and a characteristic-defining
 * count (Nishoba Brawler). Each basic land type counts once, however many lands have it, and
 * only the controller's lands count (the rulings).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, enter, hand, life, pt, spawn, table, toHand, toLibrary } from "./harness.js";

describe("domain", () => {
  it("counts each basic land type once, only among your lands (Nishoba Brawler's CDA)", () => {
    const { game } = table();
    const brawler = spawn(game, "Nishoba Brawler");
    expect(pt(game, brawler)).toEqual({ power: 0, toughness: 3 });
    spawn(game, "Forest");
    expect(pt(game, brawler).power).toBe(1);
    // A dual counts both its types; a second Forest or Island adds nothing.
    spawn(game, "Hallowed Fountain");
    spawn(game, "Breeding Pool");
    spawn(game, "Forest");
    expect(pt(game, brawler).power).toBe(3);
    // An opponent's lands and a land with no basic type don't count.
    spawn(game, "Mountain", B);
    spawn(game, "Wastes");
    expect(pt(game, brawler).power).toBe(3);
  });

  it("deals damage to each opponent equal to the count as it resolves (Meria's Outrider)", () => {
    const { game } = table();
    spawn(game, "Forest");
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    const before = life(game, A);
    enter(game, "Meria's Outrider");
    expect(life(game, B)).toBe(20 - 2);
    expect(life(game, A)).toBe(before);
  });

  it("reduces a spell's generic cost, never its {G} (Yavimaya Sojourner)", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) spawn(game, land);
    // {7}{G} less {5} is {2}{G}: five lands pay it, and couldn't pay eight.
    cast(game, toHand(game, "Yavimaya Sojourner"));
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id]?.cardName === "Yavimaya Sojourner")).toBe(true);
  });

  it("reduces an activated ability's cost (Jodah's Codex)", () => {
    const { game } = table();
    const codex = spawn(game, "Jodah's Codex");
    const lands = ["Plains", "Island", "Swamp", "Mountain", "Forest"].map((land) => spawn(game, land));
    toLibrary(game, "Island");
    const cards = hand(game, A).length;
    // {5} less {5}: only the tap.
    activate(game, codex);
    expect(hand(game, A).length).toBe(cards + 1);
    for (const land of lands) expect(game.state.objects[land]?.tapped).toBe(false);
  });
});
