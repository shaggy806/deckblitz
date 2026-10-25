/**
 * Awaken N—[cost] (rule 702.113): cast for [cost] rather than the mana cost, the spell also puts
 * N +1/+1 counters on target land you control and makes it a 0/0 Elemental creature with haste
 * that's still a land — `CardDefinition.overload` with `keyword: "awaken"` (the `awaken()`
 * helper), its targets the printed ones and then the land.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  types,
  zone,
} from "./harness.js";

describe("awaken (rule 702.113)", () => {
  it("Ruinous Path: cast for its awaken cost, destroys and makes a 4/4 Elemental land with haste", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const [land] = lands(game, "Swamp", 7);
    cast(game, toHand(game, "Ruinous Path"), { targets: [ref(bears), ref(land)], overload: true });
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, land)).toBe(4);
    expect(pt(game, land)).toEqual({ power: 4, toughness: 4 });
    expect(types(game, land)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, land)).toEqual(expect.arrayContaining(["Swamp", "Elemental"]));
    expect(keywords(game, land).has("haste")).toBe(true);
  });

  it("cast for its mana cost, it needs no land and touches none", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const [land] = lands(game, "Swamp", 3);
    cast(game, toHand(game, "Ruinous Path"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, land)).toBe(0);
    expect(types(game, land)).not.toContain("creature");
  });

  it("isn't offered without the awaken cost's mana, and is labelled awaken when it is", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    toHand(game, "Ruinous Path");
    const variants = () =>
      game.legalActions(A).filter((l) => l.kind === "cast-spell" && game.state.objects[l.card].cardName === "Ruinous Path");
    expect(variants().some((l) => l.kind === "cast-spell" && l.overload === true)).toBe(false);
    lands(game, "Swamp", 4);
    const awakened = variants().find((l) => l.kind === "cast-spell" && l.overload === true);
    expect(awakened).toMatchObject({ overloadKeyword: "awaken", overloadCost: "{5}{B}{B}" });
  });

  it("Clutch of Currents: an illegal creature target still leaves the land awakened", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const [land] = lands(game, "Island", 5);
    cast(game, toHand(game, "Clutch of Currents"), { targets: [ref(bears), ref(land)], overload: true, settle: false });
    destroy(game, bears);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, land)).toEqual({ power: 3, toughness: 3 });
  });

  it("Coastal Discovery: with the land gone, the awakened spell doesn't resolve at all", () => {
    const { game } = table();
    const [land] = lands(game, "Island", 6);
    const before = hand(game).length;
    cast(game, toHand(game, "Coastal Discovery"), { targets: [ref(land)], overload: true, settle: false });
    destroy(game, land);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(hand(game).length).toBe(before);

    // Unawakened, it just draws.
    const { game: g2 } = table();
    lands(g2, "Island", 4);
    const before2 = hand(g2).length;
    cast(g2, toHand(g2, "Coastal Discovery"));
    expect(hand(g2).length).toBe(before2 + 2);
  });

  it("Planar Outburst: the land is awakened after the wipe, so it survives", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const [land] = lands(game, "Plains", 8);
    cast(game, toHand(game, "Planar Outburst"), { targets: [ref(land)], overload: true });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, land)).toBe("battlefield");
    expect(pt(game, land)).toEqual({ power: 4, toughness: 4 });
  });
});
