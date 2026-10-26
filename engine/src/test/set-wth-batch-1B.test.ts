/**
 * Weatherlight (WTH), batch 1, group B (2026-10-26): the rest of the set.
 * Written on the shared table in `harness.ts`, each test from the card's
 * Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Null Rod", () => {
  it("stops an artifact's activated ability", () => {
    const { game } = table();
    const biskelion = spawn(game, "Serrated Biskelion");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Null Rod", B);
    expect(() => activate(game, biskelion, 0, { targets: [ref(bears)] })).toThrow(/refused/);
  });
});

describe("Serrated Biskelion", () => {
  it("puts a -1/-1 counter on itself and on the target", () => {
    const { game } = table();
    const biskelion = spawn(game, "Serrated Biskelion");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, biskelion, 0, { targets: [ref(bears)] });
    expect(counters(game, biskelion, "-1/-1")).toBe(1);
    expect(counters(game, bears, "-1/-1")).toBe(1);
  });
});

describe("Noble Benefactor", () => {
  it("lets each player search for a card when it dies", () => {
    const { game, a, b } = table();
    const benefactor = spawn(game, "Noble Benefactor");
    const mine = toLibrary(game, "Grizzly Bears", A);
    const theirs = toLibrary(game, "Shock", B);
    pickModes(a, 0);
    pickModes(b, 0);
    pickFromZone(a, mine);
    pickFromZone(b, theirs);
    destroy(game, benefactor);
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, theirs)).toBe("hand");
  });

  it("a player who declines doesn't search", () => {
    const { game, a, b } = table();
    const benefactor = spawn(game, "Noble Benefactor");
    const mine = toLibrary(game, "Grizzly Bears", A);
    const before = hand(game, B).length;
    pickModes(a, 0);
    pickModes(b);
    pickFromZone(a, mine);
    destroy(game, benefactor);
    expect(zone(game, mine)).toBe("hand");
    expect(hand(game, B).length).toBe(before);
  });
});

describe("Peacekeeper", () => {
  it("is sacrificed at its controller's upkeep unless they pay {1}{W}", () => {
    const { game, a } = table();
    const kept = spawn(game, "Peacekeeper");
    lands(game, "Plains", 2);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, kept)).toBe("battlefield");
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, kept)).toBe("graveyard");
  });
});

describe("Goblin Vandal", () => {
  it("pays {R} to destroy an artifact and deals no combat damage", () => {
    const { game, a } = table();
    const vandal = spawn(game, "Goblin Vandal");
    lands(game, "Mountain", 1);
    const rod = spawn(game, "Null Rod", B);
    pickTargets(a, rod);
    pickModes(a, 0);
    attack(game, a, [vandal]);
    expect(zone(game, rod)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Goblin Grenadiers", () => {
  it("is sacrificed to destroy a creature and a land", () => {
    const { game, a } = table();
    const grenadiers = spawn(game, "Goblin Grenadiers");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const forest = spawn(game, "Forest", B);
    pickTargets(a, bears, forest);
    pickModes(a, 0);
    attack(game, a, [grenadiers]);
    expect(zone(game, grenadiers)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Harvest Wurm", () => {
  it("stays if a basic land card is returned from the graveyard", () => {
    const { game, a } = table();
    const forest = toGraveyard(game, "Forest");
    pickModes(a, 0);
    const wurm = enter(game, "Harvest Wurm");
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, wurm)).toBe("battlefield");
  });

  it("is sacrificed with no basic land card in the graveyard", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    const wurm = enter(game, "Harvest Wurm");
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Blossoming Wreath", () => {
  it("gains life for each creature card in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Blossoming Wreath"));
    expect(life(game, A)).toBe(22);
  });
});

describe("Urborg Stalker", () => {
  it("damages a player at their upkeep only if they control a nonblack, nonland permanent", () => {
    const { game } = table();
    spawn(game, "Urborg Stalker");
    spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    expect(life(game, B)).toBe(19);
    nextTurn(game);
    // Alice controls only the black Stalker.
    expect(life(game, A)).toBe(20);
  });
});

describe("Timid Drake", () => {
  it("returns to its owner's hand when another player's creature enters", () => {
    const { game } = table();
    const drake = spawn(game, "Timid Drake");
    enter(game, "Grizzly Bears", B);
    expect(zone(game, drake)).toBe("hand");
  });
});
