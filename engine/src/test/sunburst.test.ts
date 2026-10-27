// Sunburst (rule 702.44): a counter for each colour of mana spent to cast it —
// +1/+1 counters on a creature, charge counters otherwise — and none unless
// it entered from the stack as a resolving spell (702.44b). Fifth Dawn's
// sunburst cards ride on it (batch 213).
import { describe, expect, it } from "vitest";
import { A, B, activate, cast, counters, enter, lands, pt, ref, spawn, table, toHand, zone } from "./harness.js";

describe("sunburst", () => {
  it("a creature cast with three colours enters with three +1/+1 counters", () => {
    const { game } = table();
    spawn(game, "Plains");
    spawn(game, "Island");
    spawn(game, "Swamp");
    const myr = toHand(game, "Suntouched Myr");
    cast(game, myr);
    expect(zone(game, myr)).toBe("battlefield");
    expect(counters(game, myr)).toBe(3);
    expect(counters(game, myr, "charge")).toBe(0);
    expect(pt(game, myr)).toEqual({ power: 3, toughness: 3 });
  });

  it("colourless mana is no colour: a 0/0 cast with Wastes dies", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const myr = toHand(game, "Suntouched Myr");
    cast(game, myr);
    expect(zone(game, myr)).toBe("graveyard");
  });

  it("two of one colour count once", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    spawn(game, "Mountain");
    const myr = toHand(game, "Suntouched Myr");
    cast(game, myr);
    expect(counters(game, myr)).toBe(2);
  });

  it("a noncreature artifact gets charge counters instead", () => {
    const { game } = table();
    spawn(game, "Mountain");
    spawn(game, "Forest");
    const prism = toHand(game, "Pentad Prism");
    cast(game, prism);
    expect(counters(game, prism, "charge")).toBe(2);
    expect(counters(game, prism)).toBe(0);
  });

  it("put onto the battlefield without being cast, it gets none (702.44b)", () => {
    const { game } = table();
    // Spawned, not cast: no colours were spent, so neither gets any.
    const oracle = enter(game, "Etched Oracle");
    expect(counters(game, oracle)).toBe(0);
    const prism = enter(game, "Pentad Prism");
    expect(counters(game, prism, "charge")).toBe(0);
  });

  it("Modular—Sunburst is +1/+1 counters, one per colour (702.44c)", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest", "Wastes"]) spawn(game, land);
    const wanderer = toHand(game, "Arcbound Wanderer");
    cast(game, wanderer);
    expect(counters(game, wanderer)).toBe(5);
    expect(counters(game, wanderer, "charge")).toBe(0);
  });

  it("Engineered Explosives: X paid in two colours, then destroys each nonland permanent of mana value 2", () => {
    const { game } = table();
    spawn(game, "Plains");
    spawn(game, "Island");
    const ee = toHand(game, "Engineered Explosives");
    cast(game, ee, { x: 2 });
    expect(counters(game, ee, "charge")).toBe(2);
    const bears = spawn(game, "Grizzly Bears", B);
    const memnite = spawn(game, "Memnite", B);
    lands(game, "Wastes", 2);
    activate(game, ee, 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, memnite)).toBe("battlefield");
  });

  it("Opaline Bracers: equipped creature gets +X/+X for its charge counters", () => {
    const { game } = table();
    spawn(game, "Plains");
    spawn(game, "Island");
    spawn(game, "Swamp");
    spawn(game, "Wastes");
    const bracers = toHand(game, "Opaline Bracers");
    cast(game, bracers);
    expect(counters(game, bracers, "charge")).toBe(3);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, bracers, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });

  it("Heliophial deals damage equal to its charge counters", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Wastes", "Wastes", "Wastes"]) spawn(game, land);
    const phial = toHand(game, "Heliophial");
    cast(game, phial);
    lands(game, "Wastes", 2);
    activate(game, phial, 0, { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(18);
    expect(game.state.players[A].life).toBe(20);
  });
});
