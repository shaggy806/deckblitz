/**
 * The `onlyColorItsControllerChose` filter clause — Selective Obliteration:
 * "Each player chooses a color. Then exile each permanent unless it's
 * colorless or it's only the color its controller chose."
 */
import { describe, expect, it } from "vitest";

import { B, cast, lands, pickModes, spawn, table, toHand, zone } from "./harness.js";

describe("Selective Obliteration", () => {
  it("each player's permanents are judged by the colour that player chose; multicoloured always go", () => {
    const seats = table();
    const { game } = seats;
    const bears = spawn(game, "Grizzly Bears");
    const drake = spawn(game, "Wind Drake");
    const lavinia = spawn(game, "Lavinia, Azorius Renegade");
    const ring = spawn(game, "Sol Ring");
    const goblin = spawn(game, "Raging Goblin", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const wastes = lands(game, "Wastes", 5);
    pickModes(seats.a, 4); // Green
    pickModes(seats.b, 3); // Red
    const spell = toHand(game, "Selective Obliteration");
    cast(game, spell);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, drake)).toBe("exile");
    expect(zone(game, lavinia)).toBe("exile");
    expect(zone(game, ring)).toBe("battlefield");
    expect(wastes.every((id) => zone(game, id) === "battlefield")).toBe(true);
    expect(zone(game, goblin)).toBe("battlefield");
    expect(zone(game, theirBears)).toBe("exile");
  });

  it("the same colour chosen by both spares both players' permanents of it", () => {
    const seats = table();
    const { game } = seats;
    const bears = spawn(game, "Grizzly Bears");
    const theirBears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 5);
    pickModes(seats.a, 4);
    pickModes(seats.b, 4);
    cast(game, toHand(game, "Selective Obliteration"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, theirBears)).toBe("battlefield");
  });
});
