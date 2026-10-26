// Eventide (EVE), batch 1, group A.
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, enter, keywords, lands, pt, settle, spawn, table, toHand, toStep } from "./harness.js";

describe("Noxious Hatchling and Woodlurker Mimic", () => {
  it("a black-green spell removes two counters and triggers the mimic; a mono-green one does neither for the mimic", () => {
    const { game } = table();
    const hatchling = enter(game, "Noxious Hatchling");
    expect(counters(game, hatchling, "-1/-1")).toBe(4);
    expect(pt(game, hatchling)).toEqual({ power: 2, toughness: 2 });
    const mimic = spawn(game, "Woodlurker Mimic");

    lands(game, "Wastes", 1);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Woodlurker Mimic"));
    expect(counters(game, hatchling, "-1/-1")).toBe(2);
    expect(pt(game, mimic)).toEqual({ power: 4, toughness: 5 });
    expect(keywords(game, mimic).has("wither")).toBe(true);

    lands(game, "Wastes", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, hatchling, "-1/-1")).toBe(1);
  });
});

describe("Wake Thrasher", () => {
  it("gets +1/+1 for each permanent of yours that untaps in your untap step", () => {
    const { game } = table();
    const thrasher = spawn(game, "Wake Thrasher", A, { tapped: true });
    spawn(game, "Wastes", A, { tapped: true });
    spawn(game, "Wastes", A, { tapped: true });
    spawn(game, "Wastes", B, { tapped: true });
    toStep(game, "upkeep");
    settle(game);
    expect(pt(game, thrasher)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Invert the Skies", () => {
  it("with only {G} spent, opponents' creatures lose flying and yours don't gain it", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Wastes", 3);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Invert the Skies"));
    expect(keywords(game, angel).has("flying")).toBe(false);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });

  it("with {G} and {U} spent, does both", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Island", 3);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Invert the Skies"));
    expect(keywords(game, angel).has("flying")).toBe(false);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Altar Golem", () => {
  it("counts every creature on the battlefield", () => {
    const { game } = table();
    const golem = spawn(game, "Altar Golem");
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, golem)).toEqual({ power: 3, toughness: 3 });
  });
});
