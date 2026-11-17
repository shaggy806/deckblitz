/**
 * "If this card is in a graveyard, effects from spells named Muscle Burst
 * count it as a card named Muscle Burst." (Diligent Farmhand; Pardic Firecat
 * for Flame Burst): a graveyard static's `countsAsNamedFor` (rule 113.6b),
 * read by a `name` filter that a resolving spell of that name applies
 * (`FilterContext.spellName`) — Muscle Burst's "3 plus the number of cards
 * named Muscle Burst in all graveyards".
 */
import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import {
  A,
  B,
  activate,
  cast,
  lands,
  life,
  pickFromZone,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Diligent Farmhand", () => {
  it("counts as a Muscle Burst in any graveyard for a resolving Muscle Burst", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Diligent Farmhand", B);
    toGraveyard(game, "Muscle Burst");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Muscle Burst"), { targets: [ref(bears)] });
    // 3 + the Muscle Burst + the Farmhand.
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
  });

  it("counts for nothing on the battlefield", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Diligent Farmhand");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Muscle Burst"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });

  it("is still a card named Diligent Farmhand to anything but a spell named Muscle Burst", () => {
    const { game } = table();
    const farmhand = toGraveyard(game, "Diligent Farmhand");
    const registry = registryOf(game);
    expect(matchesFilter(game.state, registry, farmhand, { name: "Muscle Burst" }, { you: A })).toBe(false);
    expect(matchesFilter(game.state, registry, farmhand, { name: "Muscle Burst" }, { you: A, spellName: "Flame Burst" })).toBe(false);
    expect(matchesFilter(game.state, registry, farmhand, { name: "Muscle Burst" }, { you: A, spellName: "Muscle Burst" })).toBe(true);
    expect(matchesFilter(game.state, registry, farmhand, { name: "Diligent Farmhand" }, { you: A })).toBe(true);
  });

  it("{1}{G}, sacrificed: fetches a basic land tapped, and then counts for Muscle Burst", () => {
    const { game, a } = table();
    const farmhand = spawn(game, "Diligent Farmhand");
    const forest = toLibrary(game, "Forest");
    lands(game, "Forest", 2);
    pickFromZone(a, forest);
    activate(game, farmhand, 0);
    expect(zone(game, farmhand)).toBe("graveyard");
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Muscle Burst"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Pardic Firecat", () => {
  it("counts as a Flame Burst in a graveyard for a resolving Flame Burst", () => {
    const { game } = table();
    toGraveyard(game, "Pardic Firecat", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Flame Burst"), { targets: [{ kind: "player", player: B }] });
    // 2 + the Firecat.
    expect(life(game, B)).toBe(17);
  });
});
